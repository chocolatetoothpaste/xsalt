(function() {
"use strict";

function XSalt() {
	this.controller = {};
	this.fn = {};
}

XSalt.prototype.ctrl = function ctrl(ctrl, fn) {
	var xsctrl = `[xs-ctrl=${ctrl}]`;
	var handler = {
		set: (obj, prop, val) => {
			obj[prop] = (function watch(v) {
				if( typeof val === 'object' || val instanceof Array ) {
					for( let i in v ) {
						if( typeof v[i] === 'object' || v[i] instanceof Array )
							v[i] = watch(new Proxy(v[i], handler));
					}

					v = new Proxy(v, handler);
				}

				return v;
			})(val);

			this.compile(document.querySelectorAll(xsctrl));
		},
		deleteProperty: (obj, prop) => {
			delete obj[prop];

			this.compile(document.querySelectorAll(xsctrl));
		}
	};

	// assign the controller
	this.controller[ctrl] = new Proxy({}, handler);

	fn.call(null, this.controller[ctrl]);

	return this.controller[ctrl];
};


XSalt.prototype.compile = function compile(nodes) {
	[].forEach.call(nodes, (node) => {
		// grab the name of the controller
		var ctrl = node.getAttribute('xs-ctrl');

		// clone the template contents
		var content = document.importNode(node.childNodes[1].content, true);

		var sel = [
			'[xs-click]',
			'[xs-submit]',
			'[xs-change]',
			'[xs-keyup]',
			'[xs-each]'
		].join(', ');

		// grab all the nodes that "do something"
		var children = content.querySelectorAll(sel);

		[].forEach.call(children, (child) => {
			if( child.hasAttribute('xs-each') ) {
				var data = this.controller[ctrl][child.getAttribute('xs-each')];

				if( typeof data !== 'undefined' ) {
					var frag = ' ';

					[].forEach.call(node.children, (tmpl) => {
						if( tmpl.tagName === 'TEMPLATE' )
							frag += tmpl.outerHTML;
					});

					frag += this.parse.each.call(this, child, data);

					node.innerHTML = frag;
				}
			}
		});
	});

	document.addEventListener('click', (e) => {
		e.stopImmediatePropagation();

		if( e.target.getAttribute('xs-click') ) {
			var cb = e.target.getAttribute('xs-click')
				.replace(/[\'\"]|\)$/g, '')
				.split('(')

			this.controller.CarsCtrl[cb.shift()].call(null)
		}
	}, false);
};


XSalt.prototype.parse = {

xscall: function xscall(stmt, data) {
	stmt = stmt.replace(/[\'\"]|\)$/g, '').split('(');
	stmt.push(data);

	return this.controller.CarsCtrl[stmt.shift()].apply( null, stmt );
},

each: function parse_each( tmpl, data ) {
	var frag = '',
		re = /\$\{([\w]+)\}/g,
		v,
		args = [],
		attr_list = [
			'[xs-if]',
			'[xs-class]'
		].join(', ');

	while( ( v = re.exec(tmpl.outerHTML) ) !== null ) {
		args.push(v[1]);
	}

	for( let d in data ) {
		var clone = tmpl.cloneNode(true);

		if( clone.hasAttribute('xs-class') ) {
			var f = clone.getAttribute('xs-class');
			clone.className += this.parse.xscall.call(this, f, data[d])
		}

		[].forEach.call(clone.querySelectorAll(attr_list), (n) => {
			if( n.hasAttribute('xs-if')
				&& ! this.parse.xscall.call(this, n.getAttribute('xs-if'), data[d]) ) {
					n.parentNode.removeChild(n);
			}

			if( n.hasAttribute('xs-class') ) {
				var f = n.getAttribute('xs-class');
				n.className += this.parse.xscall.call(this, f, data[d])
			}
		});

		var html = clone.outerHTML;

		if( typeof this.fn[html] === 'undefined' ) {
			this.fn[html] = Function.apply(null, args.concat('return `' + html + '`;'));
		}

		var val = [];

		// convert var to let when browsers catch up
		for( let i = 0, len = args.length; i < len; ++i ) {
			val.push(data[d][args[i]] || '');
		}

		frag += this.fn[html].apply(null, val);
	}

	return frag;
}

};


if( typeof module !== "undefined" && module.exports ) {
	module.exports = new XSalt();
}
else {
	window.xsalt = new XSalt();
}

})();
