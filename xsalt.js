(function() {
"use strict";

function XSalt() {
	this.controller = {};
	this.fn = {};
	this.ev = {};
}

XSalt.prototype.ctrl = function ctrl(ctrl, fn) {
	var xsctrl = `[xs-ctrl=${ctrl}]`;

	var handler = {
		set: (obj, prop, val) => {
			obj[prop] = (function watch(v) {
				var t = typeof val;
				if( Object(val) === val || val instanceof Array ) {
					for( let i in v ) {
						if( Object(v[i]) === v[i] || v[i] instanceof Array )
							v[i] = watch(new Proxy(v[i], handler));
					}

					v = new Proxy(v, handler);
				}

				return v;
			})(val);

			if( typeof val !== 'function')
				this.compile(document.querySelectorAll(xsctrl));
		},
		deleteProperty: (obj, prop) => {
			delete obj[prop];

			if( typeof val !== 'function')
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
				//
				// || child.hasAttribute('xs-submit')
				// || child.hasAttribute('xs-change')
				// || child.hasAttribute('xs-keyup')
			if( child.hasAttribute('xs-click') ) {
				var attr = child.getAttribute('xs-click');

				if( typeof this.ev['click' + attr] === 'undefined' ) {
					this.ev['click' + attr] = attr;

					var fn = (e) => {
						var cb = e.target
							.getAttribute('xs-click')
							.replace(/[\'\"]|\)$/g, '')
							.split('(')

						var args = cb[1].split(',').map((v) => {
							return v.trim();
						});

						this.controller[ctrl][cb.shift()].apply(null, args);
					};

					document.removeEventListener('click', fn);
					document.addEventListener('click', fn);
				}
			}
		});
	});
};


XSalt.prototype.parse = {

xscall: function xscall(stmt, args, data) {
	var ret = false;

	if( /^\$/.test(stmt) ) {
		var b = Function.apply(null, args.concat('return `' + stmt + '`;'))
			.apply(null, args.map( (v) => {
				return data[v];
			}));

		ret = ( b === 'true' );
	}

	else if( /\(.*\)/.test(stmt) ) {
		stmt = stmt.replace(/[\'\"]|\)$/g, '').split('(');
		stmt.pop();
		stmt.push(data);

		ret = this.controller.CarsCtrl[stmt.shift()].apply( null, stmt );
	}

	return ret;
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
			clone.className += this.parse.xscall.call(this, f, null, data[d])
		}

		[].forEach.call(clone.querySelectorAll(attr_list), (n) => {
			if( n.hasAttribute('xs-if')
				&& ! this.parse.xscall.call(this, n.getAttribute('xs-if'), args, data[d]) ) {
					n.parentNode.removeChild(n);
			}

			if( n.hasAttribute('xs-class') ) {
				var f = n.getAttribute('xs-class');
				n.className += this.parse.xscall.call(this, f, null, data[d])
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
