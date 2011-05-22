(function(){
	
	var comments = $('#comments'),
		myForm = $('form');
	
	// call the plugin on the form object:	
	myForm.SymphonyFormInlineValidate({
		
			url:'/path/to/ajax-validationpage/',          // url to your validation and response xml,
			doSubmit : true,                                       // boolean, weather to let this script handle your form submit or not.
                                                                   // Note: if set to false, you have to make sure that you prevent default action on submit while the form has not fully validated
			urlParamsField : '[name*=entry], [name*=blogpost]',    // comma seperated list of field selectors: additional url parameter form hidden fields
 			urlParamsFixedVars : 'param1=foo,param2=baz',          // comma seperated list , additional fixed url parameter
			resultSelector : 'recent-comment',                     // selector for xml node that contains your expected submit result
			resultFilter : '.comment',                             // optional selector, selects Element within 'resultSelector'
			
			
			/**
			* this also represents the default behaviour, change it to your needs
			* ====================================================================
			* context   this : the field element
			* @param 	message		Object Literal, contains validation info. Properties: 'validates' : boolean
			* @param 	name		field name
			* @param 	required 	bool or undefined, if true, field is a required field
			*/			
			onValidationSuccess : function( message, name, required ) {
				// example code : 
				if ( required ) {
					this.css({borderColor:'greenyellow'});	
				} else {
					this.css({borderColor:''});	
				}			
			},
			
			/**
			 * context  this : the field element
			 * @param 	message		Object Literal, contains validation info. Properties: 'error' : general error message, 'label:' field-name, 'message': specific field error, 'type': type of error, 'validates', boolean 
			 * @param 	name		field name
			 */					
			onValidationError : function( message, name ) {
				// example code : 
				this.css({borderColor:'red'});
			},			
			/**
			 * context  this : the form element
			 */								
			onSubmitStart  : function (form) {
				// your stuff here
			},
			/**
			 * context  this : the form element
			 * @param   fields : the input FormElements
			 */											
			onSubmitEnd  : function ( fields ) {
				// example code : 
				this[0].reset();
				fields.css({borderColor:''});	
			},
			/**
			 * if form was successfully submitted and result was returned
			 * ===========================================================
			 * context  this : the form element
			 * @param   resultText : filtered xml response as html / text
			 * @status  Object Literal : status information. Properties: 'result' : string ( error or success ), 'message' : string (error or success message)
			 */											
			
			onSubmitSuccess  : function (resultText, status ) {
				// example code :
				var res = $(resultText).hide();
				res.appendTo(comments).show( 500 );
			},
			/**
			 * basically the same as onSubmitSuccess but contains
			 * an error message in status argument Object and
			 * propably no resultText
			 * ===========================================================
			 * context  this : the form element
			 * @param   resultText : filtered xml response as html / text, probably empty
			 * @status  Object Literal : status information. Properties: 'result' : string ( error or success ), 'message' : string (error or success message)
			 */														
			onSubmitError  : function (resultText, status ) {
				// do your error handling here
			}			

			
	});
	
	////if you want to teardown the plugin maually, you can do something like:
	//	  var myFormSubmitObj = $('form').data('SymphonyFormInlineValidate');
	//	  if ( true ) {
	//		  myFormSubmitObj.teardown();  
	//	  }
	//
	
}());
		