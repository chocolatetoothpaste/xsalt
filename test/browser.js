console.clear();

var button = xsalt('<xs:button val="text" text="html">Click here</button>').compile({ text: "xsaltValue", html: "xsaltHTML" });
console.assert(button === '<button value="xsaltValue">xsaltHTML</button>', "Simple var replacement");

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
	+ '<xs:input type="text" each="food.vegetables" val="name" name="folder">');

var ff = form.compile(data);
console.assert(ff === '<form method="POST" action="process.php"><input type="text" name="folder" value="Corn"><input type="text" name="folder" value="Peas"><input type="text" name="folder" value="Carrots"></form>', "Var mapping");

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
	+ '<xs:li each="users" html="username" data-action="some action">');

var out = users.compile(list, function(node, data) {
	if( data.type == 2 ) {
		node.className += "edit";
	}
});

console.assert(out === '<ul class="items users"><li data-action="some action">ross</li><li data-action="some action">steve</li><li data-action="some action" class="edit">bob</li><li data-action="some action">dan</li><li data-action="some action" class="edit">trudy</li><li data-action="some action">lucy</li></ul>', "Basic collection with user callback execution");

var consoles = [
	{ text: "PS4", value: 1 },
	{ text: "XBOX One", value: 2 },
	{ text: "Wii U", value: 3 }
];

var options = xsalt('<xs:option each="." val="value" text="text">').compile(consoles);
console.assert(options === '<option value="1">PS4</option><option value="2">XBOX One</option><option value="3">Wii U</option>', "Select root var");

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
	+ '<xs:li each="food.vegetables" html="name" data-seemore="butts" class="asdf wrinkel">');

console.assert(ul.compile(data) === '<div class="items"><button type="button" value="save">Click me!</button><ul id="rosco" class="hidden stack left"><li data-seemore="butts" class="asdf wrinkel">Corn</li><li data-seemore="butts" class="asdf wrinkel">Peas</li><li data-seemore="butts" class="asdf wrinkel">Carrots</li></ul></div>', "Mixed var types and complex structure");

var out = xsalt('<xs:input type="text" val="username" default="stewie">').compile();
console.assert(out === '<input type="text" value="stewie">', 'Default was not used or undefined');

var butt = xsalt('<xs:button type="button" html="fakester.nested.value">Click me!</xs:button>').compile();
console.assert(butt === '<button type="button">Click me!</button>', "Default HTML was not used or undefined");