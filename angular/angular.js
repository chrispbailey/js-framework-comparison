UID = 0;

function Clause(schema) {
    var self = this;
    
    // utility function to copy object by value
    self.clone = function(array) {
	    var new_array = [];
    	for (index in array) {
    		var item = {};
    		item.id = array[index].id;
    		item.label = array[index].label;
    		item.checked = true;
    		new_array.push(item);
    	}
    	return new_array;
    };
    
    self.question = schema.schema;

    self.operators = schema.options;
    
    self.operator = schema.options[0];
    
    self.values = self.clone(schema.values);
    
    self.searchstring = '';
    
    self.id = UID++;
    
    // this function is called when the schema key changes
    // we update the other components of this model
    self.changeQuestion = function() { 
	    schema = angular.element("#controller").scope().get_schema_element(self.question);
    	self.operators = schema.options;
    	self.operator = schema.options[0];
    	self.values = self.clone(schema.values);
    };
    

    
    // the type of this operator (options or text)
	self.optype = function() {
		if (self.operator.type != 'Substring')
			return 'options';
		return 'text';
	};

    
    // generate the expression for this clause
    self.expression = function() {
        var expression = self.operator.type + '(' + self.question;
        
        if (self.optype() == 'text') {
        	expression += ',"'+self.searchstring+'"';
        }
        else
        {
        	for (index in self.values)
        	{
        		if (self.values[index].checked) expression += ',' + self.values[index].id;
        	}
        }

       	expression += ')';

        if (self.operator.negate) {
        	expression = 'Not('+expression+')';
        }

	    return expression;
    };
}

function ClauseEditorCtrl($scope) {
	
	$scope.questions = [];
	
	$scope.optionOperators = [
		{type:'IndexExists', label: 'is one of', negate: false},
		{type:'IndexExists', label: 'is not one of', negate: true},
	];
	
	$scope.textOperators = [
		{type:'Substring', label: 'contains', negate: false},
		{type:'Substring', label: 'does not contain', negate: true},
	];

	for (key in SCHEMA) {
		var	type = SCHEMA[key]['type'];
		$scope.questions.push({
			schema:key, 
			label:SCHEMA[key]['label'],
			values: SCHEMA[key]['options'],
			options: type == 'Multi' ? $scope.optionOperators : $scope.textOperators,
		});
	}


	$scope.clauses = [
		new Clause($scope.questions[0]),
	];

	$scope.addClause = function() {
		$scope.clauses.push(new Clause($scope.questions[0]));
	};
	
	$scope.removeClause = function(clause) {
		for (index in $scope.clauses) {
			if ($scope.clauses[index] == clause)
			{
				$scope.clauses.splice(index,1);
			}
		}
	};

	// utility function for model to get the corresponding schema for it's key
	$scope.get_schema_element = function(key)
	{
	    for (index in $scope.questions) {
	    	if ($scope.questions[index].schema == key)
    		{
    			return $scope.questions[index];
    		}
    	}
    };
	
	$scope.toString = function(){
		var expression = '';
		angular.forEach($scope.clauses, function(clause) {
    	  expression +=  ',' + clause.expression();
	    });
	    
	    expression = expression.substring(1);
	    
    	if ($scope.clauses.length > 1)
    		return 'And(' + expression + ')';
    	else 
    		return expression;
	};
}
