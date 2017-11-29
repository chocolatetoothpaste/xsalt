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

	if( document.readyState === 'complete' ) {
		fn.call(null, this.controller[ctrl]);
	}
	else {
		let load = (e) => {
			e.target.removeEventListener(e.type, load);
			fn.call(null, this.controller[ctrl]);
		};
		
		window.addEventListener( 'load', load, true );
	}


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
		];

		// grab all the nodes that "do something"
		var children = content.querySelectorAll(sel.join(', '));

		var xsattr = ['xs-each', 'xs-click'];

		[].forEach.call(children, (child) => {
			xsattr.forEach( val => {
				if( child.hasAttribute(val) ) {
					this.parse[val].call(this, node, child, ctrl, child.getAttribute(val));
				}
			});
		});
	});
};


XSalt.prototype.parse = {
	'xs-click': function(node, child, ctrl, attr) {

		if( typeof this.ev['click'] === 'undefined' ) {
			this.ev['click'] = attr;

			var fn = (e) => {
				if( ! e.target.hasAttribute('xs-click') ) {
					return false;
				}
				var cb = e.target
					.getAttribute('xs-click')
					.replace(/['"]|\)$/g, '')
					.split('(');

				var args = cb[1].split(',').map((v) => {
					return v.trim();
				});

				this.controller[ctrl][cb.shift()].apply(null, args);
			};

			document.removeEventListener('click', fn);
			document.addEventListener('click', fn);
		}
	},

	'xs-each': function(node, child, ctrl, attr) {
		var data = this.controller[ctrl][attr];

		if( typeof data !== 'undefined' ) {
			var frag = ' ';

			[].forEach.call(node.children, (tmpl) => {
				if( tmpl.tagName.toLowerCase() === 'template' )
					frag += tmpl.outerHTML;
			});

			frag += this.transmogrify.each.call(this, ctrl, child, data);

			node.innerHTML = frag;
		}
	}
};

XSalt.prototype.transmogrify = {
	xscall: function xscall( ctrl, stmt, args, data ) {
		var ret = false;

		// var xstag = function xstag(strings, ...values) {
		// 	console.log(strings[1], values[1]);
		// };

		// if( args !== null ) {
		// 	args.push('xstag');
		// }

		if( /^\$/.test(stmt) ) {
			// var b = Function.apply(null, args.concat('return xstag`' + stmt + '`;'))
			var b = Function.apply(null, args.concat('return `' + stmt + '`;'))
				.apply(null, args.map( (v) => {
					return data[v];
					// return ( v === 'xstag' ? xstag : data[v] );
				}));

			ret = ( b === 'true' );
		}

		else if( /\(.*\)/.test(stmt) ) {
			stmt = stmt.replace(/[\'\"]|\)$/g, '').split('(');
			stmt.pop();
			stmt.push(data);

			ret = this.controller[ctrl][stmt.shift()].apply( null, stmt );
		}

		return ret;
	},

	each: function parse_each( ctrl, tmpl, data ) {
		var frag = '',
			re = /\$\{([\w]+)\}/g,
			v,
			args = [],
			attr_list = [
				'[xs-if]',
				'[xs-class]'
			].join(', ');

		while( ( v = re.exec(tmpl.outerHTML) ) !== null ) {
			if( args.indexOf(v[1]) === -1 )
				args.push(v[1]);
		}

		var nodes = tmpl.querySelectorAll(attr_list);

		for( let d in data ) {
			var clone = tmpl.cloneNode(true);

			if( clone.hasAttribute('xs-class') ) {
				var f = clone.getAttribute('xs-class');
				clone.className += this.transmogrify.xscall.call(this, ctrl, f, null, data[d])
			}

			[].forEach.call(nodes, (n) => {
				if( n.hasAttribute('xs-if') && ! this.transmogrify.xscall.apply(this, [
						ctrl, n.getAttribute('xs-if'), args, data[d]
					] ) ) {
						var sel = "[xs-if=\"" + n.getAttribute('xs-if') + "\"]";
						clone.querySelectorAll(sel).forEach(c => { c.innerText = '' });
				}

				if( n.hasAttribute('xs-class') ) {
					n.className += ' ' + this.transmogrify.xscall.apply( this, [
						ctrl, n.getAttribute('xs-class'), null, data[d]
					])
				}
			});

			var html = clone.outerHTML;

			if( typeof this.fn[html] === 'undefined' ) {
				var str = 'return `' + html + '`;';
				this.fn[html] = Function.apply( null, args.concat(str) );
			}

			var val = [];

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
