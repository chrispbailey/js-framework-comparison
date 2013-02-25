_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };

var app = app || {};

$(function ($) {
 
//
// MODELS
//
app.Clause = Backbone.Model.extend({
	// Default attribute values
	defaults: {
		schema_key: '', // holds the question identifier
		operator: '', // holds the operator to apply (e.g. IndexExists)
		options: new Array(), // stores the selected answers
		string: '', // stores the search string if applicable
	},

	// determines if the current question represents selectable answers (true)
	// or a freetext question (false)
	is_options_list: function() {
		var type = SCHEMA[this.get('schema_key')]['type'];

		if (type == 'Multi') return true;

		return false;
	},
	
	// generate the string representation of this expression
	toString: function() {
		expression = this.get('operator');
		if (expression.indexOf('Not') == 0) {
			expression = 'Not(' + expression.substring(3);
		}

		if (this.is_options_list()) {
			expression += '('+this.get('schema_key');
			options = this.get('options');
			for (var i=0; i < options.length; i++) {
				expression += ',' + options[i];
			}
			expression = expression +')';
		}
		else {
			expression += '('+this.get('schema_key')+',"'+this.get('string')+'")';
		}

		if (expression.indexOf('Not') == 0){
			expression += ')';
		}
		return expression;
	},
});


// Collection of Clauses
var ClauseCollection = Backbone.Collection.extend({

	model: app.Clause,

	// generate the expression for clauses contained in this collection
	toString: function() {
		expression = '';
		
		// iterate over the collection
		this.each(function(clause){ 
			expression += ',' + clause.toString();
		});
		expression = expression.substring(1);
		if (this.length < 2) return expression;
		else return 'And(' + expression + ')';
	},
});

//
// VIEWS
//
app.Clauses = new ClauseCollection;

app.ClauseView = Backbone.View.extend({

	// Cache the template function for a single clause
	clauseTpl: _.template( $('#item-template').html() ),

	events: {
		'change .question': 'change_question',
		'change .operator': 'change_operator',
		'keypress .values': 'value_changed',
		'change .values': 'value_changed',
		'click .remove': 'remove_clause',
	},

	initialize: function(){
		this.listenTo(this.model, 'destroy', this.remove);
	},

	// Re-render the individual clause editor
	render: function() {

		var schema_key = this.model.get('schema_key');

			this.$el.html( this.clauseTpl( this.model.toJSON() ) );
			this.value = this.$('.values');
			this.question_selection = this.$(".question");

			for (index in SCHEMA) {
				this.question_selection.append($("<option/>", {
				value: index,
				text: SCHEMA[index]['label'],
				selected: schema_key === index,
			}));
		}

		this.operator = this.$(".operator");
		this.$("option", this.operator).removeAttr('disabled');
		if (this.model.is_options_list()) {
			// hide non-relevant options
			this.$(".freetext",this.operator).remove();
        
			var chosen_options = this.model.get('options');

			// generate options list
			for (index in SCHEMA[schema_key]['options']) {
        		option = SCHEMA[schema_key]['options'][index];

				var input = $("<input/>", {
					type: 'checkbox',
					value: option.id,
					id: this.model.cid + '_' +option.id,
					checked: $.inArray(option.id, chosen_options),
				});
				var label = $("<label/>", {
					for: this.model.cid + '_' +option.id,
					text: ' '+option.label,
				});
				input.prependTo(label);
				this.value.append(label);
			}
		}
		else
		{
			// hide non-relevant options
			this.$(".choice",this.operator).remove();     
			this.value.append($("<input/>", {
				type: 'text',
				value: this.model.get('string'),
			}));
		}

		this.input = this.$('.edit');
	
		// update other components
		this.change_operator();
		this.value_changed();
		return this;
	},

	change_question: function() {
		console.log(this.$("option:selected", this.question_selection).val());
		this.model.set('schema_key',this.$("option:selected", this.question_selection).val());
		this.render();
		this.update_display();
	},

	change_operator: function() {
		// this should be this.$("option:selected", this.operator).val()
		// but return this.$("option:selected", this.question_selection).val() instead
		var val = $(":selected",this.el)[1].value;
		this.model.set('operator', val);
		this.update_display();
	},
  
	value_changed: function() {
		if (this.model.is_options_list()) {
			this.model.set('options',this.$("input:checked", this.value).map(function(){return this.value;}));   
		}
		else {
			this.model.set('string',this.$("input", this.value).val());
		}
		this.update_display();
	},
  
	update_display: function() {
		app.view.update_display()
	},
	
	remove_clause: function() {
		this.model.destroy();
		this.update_display();
	},
});


// The top app-level view object
app.AppView = Backbone.View.extend({

	el: $('#clause-list'),
	
	events: {
		"click .add": "add_clause",
	},

	// Add a single clause to the list
	add_clause: function() {
	    var clause = new app.Clause({schema_key: first_schema});
		app.Clauses.push(clause);
		var view = new app.ClauseView({ model: clause });
		$("#clause-list .add").before( view.render().el );
		this.update_display();
	},
	
	update_display: function() {
		$("#expression").text(app.Clauses.toString());
	}

	});
	
	for (index in SCHEMA) {
		first_schema = index;
		break
	}
	
	// Kick things off by creating the **App**.
	app.view = new app.AppView

    app.view.add_clause();
});
