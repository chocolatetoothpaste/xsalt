(function(document) {

function xsalt(tmpl) {
	// unfortunately HTML strips out certain tags if the parent tag has
	// restrictions on child elements (like select boxes). This will prefeix ALL
	// tags with "xs!:" that are not already prefixed with "xs:"
	// totally sucks, but must be done until a better solution arises
	// tmpl = tmpl.replace(/<(\/?)(?!\/?xs:?)/g, '<$1xs!:');

	// creating a sandbox for moving elements around
	// var temp = document.createElement('div');
	var temp = document.implementation.createHTMLDocument('').body;
	temp.innerHTML = tmpl;
	this.template = temp;
};


/**
 * Factory
 */

function xs(tmpl) {
	return new xsalt(tmpl);
}


/**
 * Maps an array of "keys" to a JSON object and returns the set
 */

xsalt.prototype.map = function( keys, data ) {

	return keys.reduce(function (data, key) {
		// make sure data and data[key] exist
		if( typeof data !== "undefined" && typeof data[key] !== "undefined" )
			return data[key];

	// return empty object...? maybe a bad practice, needs exploration
	// it *might* be better to throw an error here
	}, data) || {};
};


/**
 * Attribute parsers
 */

xsalt.prototype.parse = {
	each: function( node, data, callback ) {
		var that = this;

		node.removeAttribute('each');

		var frag = document.createDocumentFragment();
		var attr = Array.prototype.slice.call(node.attributes);

		data.forEach(function(i, k) {
			var n = node.cloneNode(true);
			that.parse.map(n, attr, i, callback);
			frag.appendChild(n);
		});

		node.parentNode.replaceChild(frag, node);
	},

	map: function( node, attr, data, callback ) {
		var that = this;

		// walk node to look for any actionable attributes
		if( typeof node.tagName !== "undefined" ) {
			if( typeof callback === "function" ) {
				callback.call(that, node, data);
			}

			// walk template node to look for any actionable attributes
			attr.forEach(function(v) {
				if( typeof that[v.nodeName] === "function" ) {
					that[v.nodeName].call(that, node, v.value, data);
				}
			});

			if( node.children.length > 0 ) {
				Array.prototype.forEach.call(node.children, function(n) {
					that.map(n, data, callback);
				});
			}

		}

	},

	html: function( node, key, data ) {
		if( typeof data[key] !== "undefined" ) {
			if( node.tagName.toLowerCase() === "xs" ) {
				node.outerHTML = data[key];
			}

			else {
				node.innerHTML = data[key];
			}
		}

		if( node.hasAttribute('html') )
			node.removeAttribute('html');
	},

	text: function( node, key, data ) {
		if( typeof data[key] !== "undefined" ) {
			node.textContent = data[key];
			node.removeAttribute('text');
		}
	},

	val: function( node, key, data ) {
		var val = '';

		if( typeof data[key] !== "undefined" ) {
			val = data[key];
		}

		else if( node.hasAttribute('default') ) {
			val = node.getAttribute('default');
			node.removeAttribute('default');
		}

		node.setAttribute('value', val);

		node.removeAttribute('val');
	}
};


/**
 * The native methods for node cloning and replacement are working since tag
 * names are not sanitized until the final output, so these are not needed right
 * now. they are left here for future reference

 * Clones a node and it's attributes, trimming "xs:" from the tag name
 */

xsalt.prototype.clone = function(node) {
	var tag = node.tagName.toLowerCase().replace(/^xs:/i, '');
	var n = document.createElement(tag);

	n.innerHTML = node.innerHTML;

	Array.prototype.forEach.call(node.attributes, function(v) {
		n.setAttribute(v.nodeName, v.value);
	});

	return n;
};


/**
 * Replaces one node with another

xsalt.prototype.replace = function(node, n) {
	node.parentNode.insertBefore(n, node);
	node.parentNode.removeChild(node);
};

**/

/**
 * Compiles template and data together and returns a HTML string
 */

xsalt.prototype.comp = function( data, node, callback ) {
	if( typeof node === "function" ) {
		callback = node;
		node = this.template.querySelectorAll('[xs]');
	}

	node = node || this.template.querySelectorAll('[xs]');

	for( var i = 0, l = node.length; i < l; ++i ) {
		node[i].removeAttribute('xs')
		if( node[i].hasAttribute('each') ) {
			var attr = node[i].getAttribute('each');

			// not necessary to separate the last key
			// each data set will be available in the callback individually
			var set = ( attr === '.'
				? data
				: this.map( attr.split('.'), data ) );

			this.parse.each.call(this, node[i], set, callback);
		}

		else {
			var n = node[i].cloneNode(true);
			node[i].parentNode.replaceChild(n, node[i]);

			// it is probably quicker (and easier to check) to iterate over
			// the available parsers than to iterate a nodes attributes
			for( var p in this.parse ) {
				if( node[i].hasAttribute( p ) ) {
					var path = node[i].getAttribute(p).split('.');

					// the final part of they key is separated from the map
					// so the entire data set can be passed around for use
					// in the callback
					var key = path.pop();

					// make nested var selection possible by splitting the
					// var path and mapping it to the data object
					var set = this.map(path, data);

					this.parse[p].call(this, node[i], key, set);

					if( typeof callback === "function" ) {
						callback.call(this, node[i], set);
					}
				}
			}
		}

		if( node[i] && node[i].children ) {
			this.comp(data, node[i].children, callback);
		}
	}

	return this.template.innerHTML;
};


/**
 * Compiles template and data together and returns a HTML string
 */

xsalt.prototype.compile = function( data, node, callback ) {
	if( typeof node === "function" ) {
		callback = node;
		node = this.template.children;
	}

	else {
		node = node || this.template.children;
	}

	for( var ii = 0, l = node.length; ii < l; ++ii ) {
		var tag = node[ii].tagName.toLowerCase();

		if( node[ii].hasAttribute('xs') ) {
			// collections have to be handled a little differently
			// the template node does not get replaced here since it has to be
			// "cloned" multiple times
			// iterative directives must handle this internally
			if( node[ii].hasAttribute('each') ) {
				var attr = node[ii].getAttribute('each');

				// not necessary to separate the last key
				// each data set will be available in the callback individually
				var set = ( attr === '.'
					? data
					: this.map( attr.split('.'), data ) );

				this.parse.each.call(this, node[ii], set, callback);
			}

			else {
				// hot swap the node to replace the "xs:" tag with the real one
				// this.replace(node[ii], this.clone(node[ii]));
				var n = node[ii].cloneNode(true);
				node[ii].parentNode.replaceChild(n, node[ii]);

				// it is probably quicker (and easier to check) to iterate over
				// the available parsers than to iterate a nodes attributes
				for( var p in this.parse ) {
					if( node[ii].hasAttribute( p ) ) {
						var path = node[ii].getAttribute(p).split('.');

						// the final part of they key is separated from the map
						// so the entire data set can be passed around for use
						// in the callback
						var key = path.pop();

						// make nested var selection possible by splitting the
						// var path and mapping it to the data object
						var set = this.map(path, data);

						this.parse[p].call(this, node[ii], key, set);

						if( typeof callback === "function" ) {
							callback.call(this, node[ii], set);
						}
					}
				}
			}

		}

		if( node[ii] && node[ii].children ) {
			this.compile(data, node[ii].children, callback);
		}
	}

	return this.template.innerHTML;
};

if( typeof module !== 'undefined' && module.exports ) {
	module.exports = xs;
}

else {
	window.xsalt = xs;
}

})( typeof window === "undefined" ? require('jsdom').jsdom().parentWindow.document : document );
