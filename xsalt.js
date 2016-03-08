(function() {
"use strict";

function XSalt() {
	this.controller = {};
	this.fn = {};
}

XSalt.prototype.ctrl = function ctrl(ctrl, fn) {
	var handler = {
		set: (obj, prop, val) => {
			if( typeof val === 'object' || Array.isArray(val) ) {
				for( var i in val ) {
					if( typeof val[i] === 'object' || Array.isArray(val[i]) )
						val[i] = new Proxy(val[i], handler);
				}
				val = new Proxy(val, handler);
			}

			obj[prop] = val;

			this.compile(document.querySelectorAll(`[xs-ctrl=${ctrl}]`));
		},
		deleteProperty: (obj, prop) => {
			delete obj[prop];

			this.compile(document.querySelectorAll(`[xs-ctrl=${ctrl}]`));
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

		// grab all the nodes that "do something"
		var each = content.querySelectorAll('[xs-each]');

		[].forEach.call(each, (n) => {
			var data = this.controller[ctrl][n.getAttribute('xs-each')];

			if( typeof data !== 'undefined' ) {
				var frag = ' ';

				[].forEach.call(node.children, (child) => {
					if( child.tagName === 'TEMPLATE' )
						frag += child.outerHTML;
				});

				frag += this.parse.each.call(this, n, data);

				node.innerHTML = frag;
			}
		});
	});
};


XSalt.prototype.parse = {
	xsif: function xsif(stmt, data) {
		return this.controller.CarsCtrl[stmt.split('(')[0]].call(null, data.state)

		// this parser needs major beefing up

		// var fn = Function.apply(null, Object.keys(data).concat('return ' + stmt));
		// var val = [];
		//
		// for( var d in data ) {
		// 	val.push(data[d]);
		// }
		//
		// return fn.apply(null, val);
	},
	each: function parse_each( tmpl, data ) {
		var frag = '',
			re = /\$\{([\w]+)\}/g,
			v,
			args = [];

		while( ( v = re.exec(tmpl.outerHTML) ) !== null ) {
			args.push(v[1]);
		}

		var len = args.length;

		for( var d in data ) {
			var clone = tmpl.cloneNode(true);

			[].forEach.call(clone.querySelectorAll('[xs-if]'), (n) => {
				var f = n.getAttribute('xs-if');

				if( ! this.parse.xsif.call(this, f, data[d]) ) {
					n.parentNode.removeChild(n);
				}
			});

			var html = clone.outerHTML;

			if( typeof this.fn[html] === 'undefined' ) {
				this.fn[html] = Function.apply(null, args.concat('return `' + html + '`;'));
			}

			var val = [];

			// convert var to let when browsers catch up
			for( var i = 0; i < len; ++i ) {
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
