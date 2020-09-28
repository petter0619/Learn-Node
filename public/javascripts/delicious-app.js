import '../sass/style.scss';

import { $, $$, autocomplete } from './modules/bling';
//import autocomplete from './modules/autocomplete';

autocomplete( $('#address'), $('#lat'), $('#lng') );
