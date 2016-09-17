var Cars = xsalt.ctrl('CarsCtrl', ($ctrl) => {

	$ctrl.state = function(state, $data) {
		// console.log($data)
		return $data.state === state;
	};

	$ctrl.boogers = ['asdf','ghjkl','qwerty'];

	$ctrl.styles = function($data) {
		return ( $data.state === 'UT' ? 'beehive cheddar' : '' );
	};

	$ctrl.save = function(id, ctrl) {
		console.log('bango!', id, ctrl);
	};

	/*//
	$ctrl.cars = {
		1: { _id: 1, state: 'UT', plate: '234 ASD' },
		2: { _id: 2, state: 'MT', plate: '234 MDT' },
		3: { _id: 3, state: 'WA', plate: '234 WER' },
		// state: function() {}
	};
	/*/
	$ctrl.cars = [
		{ _id: 1, state: 'UT', plate: '234 ASD', description: 'Heber Prease' },
		{ _id: 2, state: 'MT', plate: '234 MDT' },
		{ _id: 3, state: 'WA', plate: '234 WER' }
		// state: function() {}
	];
	//*/

	setTimeout( () => {
		///
		$ctrl.cars[2] = {_id: 3, state: 'AK', plate: '999 TLF'};
		// delete $ctrl.cars[2];
		/*/
		$ctrl.cars[2].state = 'AK';
		// $ctrl.cars[2].plate = 'AKT 999';
		//*/

		// console.log('update', $ctrl.cars)
	}, 5000);
});

// console.log(Cars)
