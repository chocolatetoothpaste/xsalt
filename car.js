var Cars = xsalt.ctrl('CarsCtrl', ($ctrl) => {

	$ctrl.styles = function(data) {
		if ( data.state === 'UT' ) {
			return 'beehive cheddar';
		}

		else if( data.state === 'AK' ) {
			return 'tlf';
		}

		else {
			return '';
		}
	};

	$ctrl.smiles = function(data) {
		if ( data.state === 'MT' || data.state === 'AK' ) {
			return 'mountain';
		}

		else {
			return '';
		}
	};

	$ctrl.save = function(id) {
		console.log('saving: ', $ctrl.cars[id] );
	};

	///
	$ctrl.cars = {
		1: { _id: 1, state: 'UT', plate: '234 ASD' },
		2: { _id: 2, state: 'MT', plate: '234 MDT' },
		3: { _id: 3, state: 'WA', plate: '234 WER' }
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
		$ctrl.cars[4] = {_id: 4, state: 'AK', plate: '999 TLF'};
	}, 3000);
});

Cars.delete = function del(id) {
	delete Cars.cars[id];
};
