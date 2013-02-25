UID = 0;

// Class to represent a row in the seat reservations grid
function Clause(schema, initialOperator) {
    var self = this;
    
    self.schema = ko.observable(schema);
    
    self.operators = ko.observable([]);
    
    self.operator = ko.observable('');
    
    self.string = ko.observable('');
    
    self.answers = ko.observableArray();
    
    self.id = UID++;

	self.schema.subscribe(function(key) {
		self.update(key);
	});
	
	self.update = function(key) {
		var type = SCHEMA[key.schema]['type'];
		if (type == 'Multi') {
			self.operators([
				{op:'IndexExists', label: 'one of', type:'option'},
				{op:'NotIndexExists', label:'is not one of', type:'option'}
			]);
		}
		else
		{
			self.operators([
				{op:'Substring', label: 'contains', type:'text'},
				{op:'NotSubstring', label:'does not contain', type:'text'}
			]);
		}
		
		// add checked option to bind against
		self.answers.removeAll();
		options = SCHEMA[key.schema]['options'];
		for (index in options) {
			options[index].checked = ko.observable(true);
			self.answers.push(options[index]);	
		}
	};
	
	// init model correctly
	self.update(schema);

	// the type of this operator (options or text)
	self.optype = ko.computed(function() {
		if (self.operator().indexOf('IndexExists') >= 0)
			return 'options';
		return 'text';
	});
	
    self.expression = ko.computed(function() {

        var expression = self.operator() + '(' + self.schema().schema;
        
        if (self.optype() == 'text') {
        	expression += ',"'+self.string()+'"';
        }
        else {
        	for(index in self.answers()){
        		if (self.answers()[index].checked() == true) {
	            	expression += ','+self.answers()[index].id;
            	}
        	}
        }

       	expression += ')';

        if (self.operator().indexOf('Not') == 0) {
        	expression = expression.substring(3);
        	expression = 'Not('+expression+')';
        }
        
	    return expression;
    });
    
}

// Overall viewmodel for this screen, along with initial state
function ClauseContructorViewModel() {
    var self = this;

    // Non-editable catalog data - would come from the server
    self.availableQuestions = [];
    
    for (key in SCHEMA) {
        self.availableQuestions.push({label: SCHEMA[key]['label'], schema: key});
	}
	
	
    // Editable data
    self.clauses = ko.observableArray([
        new Clause(self.availableQuestions[0]),
    ]);
    
    self.addClause = function() {
        self.clauses.push(new Clause(self.availableQuestions[0]));
    }
    
    self.removeClause = function(clause) { self.clauses.remove(clause) }
    
    self.toString = function() {
    	var expression = "";
    	for (index in self.clauses()) {
    		expression += ',' + self.clauses()[index].expression();
    	}
    	expression = expression.substring(1);
    	
    	if (self.clauses().length > 1) return 'And('+expression+')';
    	else return expression;
    }
}


$(function() {
	window.view = new ClauseContructorViewModel();
	ko.applyBindings(window.view);
});
