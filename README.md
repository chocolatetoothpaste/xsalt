# xsalt

***WARNING***
This is highly experimental and has known, major security risks.
For educational purposes only.
Bug reports and pull requests welcome.

What a template could look like:

    <html>
    <head>
        <link rel="icon" href="data:;base64,iVBORw0KGgo=">
        <link rel="stylesheet" type="text/css" href="style.css">
        <script src="xsalt.js"></script>
        <script src="car.js"></script>
    </head>
    <body>

    <ul xs-ctrl="CarsCtrl">
        <template>
            <li xs-each="cars" id="car_${_id}" xs-class="styles(${state})">
                <span>${state}</span>
                <span xs-class="smiles(${state})">${plate}</span>
                <span xs-if="${state === 'AK'}">
                    The last frontier
                </span>
                <button xs-click="save(${_id})">Save</button>
                <button xs-click="delete(${_id})">Delete</button>
            </li>
        </template>
    </ul>

    </body>
    </html>


What a controller might look like:

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

        $ctrl.cars = {
            1: { _id: 1, state: 'UT', plate: '234 ASD' },
            2: { _id: 2, state: 'MT', plate: '234 MDT' },
            3: { _id: 3, state: 'WA', plate: '234 WER' },
            4: { _id: 4, state: 'AK', plate: '999 TLF' }

        };

    });

    Cars.delete = function del(id) {
        delete Cars.cars[id];
    };
