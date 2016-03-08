var xsalt = require('../xsalt');

exports.simpleVar = function(test) {
	var button = xsalt('<xs:button val="text" html="html">Click here</button>').compile({ text: "xsaltValue", html: "xsaltHTML" });

	test.deepEqual(button,'<button value="xsaltValue">xsaltHTML</button>', "Simple var replacement");

	test.done();
};

exports.collectionWithVarMapping = function(test) {
	var data = {
		food: {
			vegetables: [
				{ name: "Corn" },
				{ name: "Peas" },
				{ name: "Carrots" }
			],
		},
		ui: { items: { button: 'save' } }
	};

	var form = xsalt('<form method="POST" action="process.php">'
		+ '<xs:input type="text" each="food.vegetables" val="name" name="folder"></form>');

	test.deepEqual(form.compile(data), '<form method="POST" action="process.php"><input type="text" name="folder" value="Corn"><input type="text" name="folder" value="Peas"><input type="text" name="folder" value="Carrots"></form>');
	test.done();

};

exports.collectionWithCallback = function(test) {

	var list = {
		users: [
			{ username: 'ross', type: 1 },
			{ username: 'steve', type: 1 },
			{ username: 'bob', type: 2 },
			{ username: 'dan', type: 1 },
			{ username: 'trudy', type: 2 },
			{ username: 'lucy', type: 1 }
		]
	};

	var users = xsalt('<ul class="items users">'
		+ '<xs:li each="users" html="username" data-action="some action"></xs:li></ul>');

	var out = users.compile(list, function(node, data) {
		if( data.type == 2 ) {
			node.className += "edit";
		}
	});

	test.deepEqual(out, '<ul class="items users"><li data-action="some action">ross</li><li data-action="some action">steve</li><li data-action="some action" class="edit">bob</li><li data-action="some action">dan</li><li data-action="some action" class="edit">trudy</li><li data-action="some action">lucy</li></ul>', "Basic collection with user callback execution");
	test.done();
};

exports.rootVar = function(test) {
	var consoles = [
		{ text: "PS4", value: 1 },
		{ text: "XBOX One", value: 2 },
		{ text: "Wii U", value: 3 }
	];

	var options = xsalt('<select class="selectbox consoles"><xs:option each="." html="text" val="value"></xs:option></select>').compile(consoles);

	test.deepEqual(options, '<select class="selectbox consoles"><option value="1">PS4</option><option value="2">XBOX One</option><option value="3">Wii U</option></select>', "Select root var");
	test.done();
};


exports.mixedVars = function(test) {
	var data = {
		food: {
			vegetables: [
				{ name: "Corn" },
				{ name: "Peas" },
				{ name: "Carrots" }
			],
		},
		ui: { items: { button: 'save' } }
	};

	var ul = xsalt('<div class="items">'
		+ '<xs:button val="ui.items.button" type="button">Click me!</xs:button>'
		+ '<ul id="rosco" class="hidden stack left">'
		+ '<xs:li each="food.vegetables" html="name" data-seemore="butts" class="asdf wrinkel"></xs:li></ul></div>');

	test.deepEqual(ul.compile(data), '<div class="items"><button type="button" value="save">Click me!</button><ul id="rosco" class="hidden stack left"><li data-seemore="butts" class="asdf wrinkel">Corn</li><li data-seemore="butts" class="asdf wrinkel">Peas</li><li data-seemore="butts" class="asdf wrinkel">Carrots</li></ul></div>');

	test.done();
};

exports.wrappedAttributes = function(test) {
	var data = {
		users: [
			{username: "bob", type: 1, id: 42},
			{username: "lucy", type: 2, id: 98},
			{username: "sandy", type: 1, id: 39},
			{username: "jerry", type: 1, id: 74}
		]
	};

	var out = xsalt('<xs:input type="text" val="username" each="users">').compile(data, function( node, data ) {
		node.setAttribute("id", "user_" + data.id);
	});

	test.deepEqual(out, '<input type="text" value="bob" id="user_42"><input type="text" value="lucy" id="user_98"><input type="text" value="sandy" id="user_39"><input type="text" value="jerry" id="user_74">', "Wrapped attributes");
	test.done();
};

exports.defaultValues = function(test) {
	var out = xsalt('<xs:input type="text" val="username.nested.value" default="stewie">').compile();
	test.deepEqual(out, '<input type="text" value="stewie">', 'Default was not used or undefined');

	var butt = xsalt('<xs:button type="button" html="fakester">Click me!</xs:button>').compile();
	test.deepEqual(butt, '<button type="button">Click me!</button>', "Default HTML was not used or undefined")

	test.done();

};