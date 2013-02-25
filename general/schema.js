// The common survey schema to work from, represented as JSON
// Each question is represented by an id, label, question type 
// and set of possible answers

var SCHEMA = {
'243': {
	'label' : 'Who is your favourite villain?',
	'type' : 'Multi',
	'options' : [
		{id:'1', label:'Keyser Söze'},
		{id:'2', label:'Darth Vader'},
		{id:'3', label:'Lex Luthor'},
		{id:'4', label:'Professor Moriarty'},
		]
	},

'244': {
	'label' : 'Which is the strongest superhero?',
	'type' : 'Multi',
	'options' : [
		{id:'5', label:'Batman'},
		{id:'6', label:'Hulk'},
		{id:'7', label:'Superman'},
		{id:'8', label:'Iron Man'},
		{id:'9', label:'Spiderman'},
		]
	},
	
'245': {
	'label' : 'What was your first comic?',
	'type' : 'FreeText object',
	'options' : []
	}

}
