/*
 *\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *
 * mailvalidation.js
 * a htmlform inline validation plugin for the jQuery JavaScript Library in use of SYMPHONY-CMS
 *
 * Copyright 2011, Thomas Appel, http://thomas-appel.com, mail(at)thomas-appel.com
 * dual licensed under MIT and GPL license
 * http://dev.thomas-appel.com/licenses/mit.txt
 * http://dev.thomas-appel.com/licenses/gpl.txt
 * 
 * Features:
 * --------------------------------------------------------------------------------------------
 * - uses symphonys built in validation features, so all validation is done server side and returned 
 *   asynchronously via ajax
 *   
 * changelog:
 * --------------------------------------------------------------------------------------------
 * - 0.2b:
 * --------------------------------------------------------------------------------------------
 *		- fixed msie issues
 * -------------------------------------------------------------------------------------------- 
 * - 0.1b:
 * --------------------------------------------------------------------------------------------
 *		- fixed false http request method caused by a missing trailing slash in the url string
 * --------------------------------------------------------------------------------------------
 *   
 * known issues:
 * --------------------------------------------------------------------------------------------
 * - MISE will fail, if there are unknowen namespaces in your xml source
 * --------------------------------------------------------------------------------------------
 * @author Thomas Appel
 * @version 0.2b
 * -------------------------------------------------------------------------------------------- 
 */


(function($){
	var exp_action = '[name^=action]',	
		exp_fieldname = /[^\[]([\w\-\d]+)/g,
		exp_stripspace = /\n+\s+/g,
		body = $('body'),
		errorHandler = {
			error1 : function (fn , args) {
				throw new Error( fn + ': expects exactly two arguments, but arguments length is'+ args.length );
			}
		};
		
	function ValidationSubmit ( ) {		
		this._init.apply(this, arguments);
	}
	
	ValidationSubmit.prototype = {
		/**
		 * @param 	elem	HTMLFormElement
		 * @param 	o		Object literal : user options
		 */
		nameSpace : 'SymphonyFormInlineValidate',
		
		_init : function ( elem, o ) {
			var params, atoms, atomsFixedVars, prefix;

			if ( arguments.length < 2 ) {
				errorHandler.error1('_init', arguments);
			}
			
			this.form = $( elem );
			this.fields = this.form.find( 'textarea, input:not([type^=hidden])').not( ':submit' ).not( ':reset' );			
			this.action = this.form.find( exp_action ).attr( 'name' ) + '=submit';
			this.name = this.action.match( exp_fieldname )[1];
			this.options = $.extend( {}, this.defaults, o );
			this.requiredFields = $();
			// a missing trailing slash in the URL causes automatic GET request instead of POST
			this.options.url = this.options.url.match(/\/$/) ? this.options.url : this.options.url + '/';
			
			if ( this.options.urlParamsField ) {
				params = '';
				atoms = this.options.urlParamsField.split(',');
				atomsFixedVars = this.options.urlParamsFixedVars.split(',');
				atoms.push.apply(atoms, atomsFixedVars);
				
				for ( var i=0, temp, l=atoms.length; i < l ; i++ ) {
					
					temp = this.form.find( atoms[i] )[0];
					prefix = i === 0 ? '?' : '&';
					if (i < (l-atomsFixedVars.length )){
						params+= prefix + temp.name.match(exp_fieldname)[1] +'='+ temp.value;	
					} else {
						params+= '&' + atoms[i];	
					}
					
				}				
			}
			
			if ( this.options.urlParamsFixedVars && !this.options.urlParamsField) { 
				
				params = '';
				atoms = this.options.urlParamsFixedVars.split(',');
				
				for (var i=0,temp,l=atoms.length; i < l ; i++) {
					prefix = i === 0 ? '?' : '&';
					params+= '&' + atoms[i];	
				}				 			
			}
			
			if (!!params ) {
				this.options.url += params; 
			}
			
			this._bind();
			this._getRequiredFileds();
		},
		_getRequiredFileds : function () {
			var that = this;
			this.fields.each(function(){
				that._onBlur(undefined, this);
			});
		},
		_bind : function () {
			this.form.delegate('input, textarea', 'blur',  $.proxy( this._onBlur, this ) );
			this.options.doSubmit && this.form.bind( 'submit',  $.proxy( this._onSubmit, this ) );
			this.form.bind('destroyed', $.proxy( this.teardown, this ) );	
		},
		
		/**
		 * @param 	event	eventdata object
		 */				
		_onSubmit : function( event ){			
			var unlock = true, that = this,
			post,flds = $();
			event.preventDefault();						
			// check if all fields allready validate
			this.fields.each(function(){
				if ( !$(this).data( that.nameSpace+'-field-validates' ) ) {	
					that._onBlur({target:this});
					flds.push(this);				
				}
			});
			
			if( flds.length ){
				unlock = false;
				this.options.submitLock.call(this,this.requiredFields);
				return;				
			}
			
			if( unlock ){
				this.options.onSubmitStart.call( this.form );
				post = this.getPostVars( this.form, this.action, 'form' );				
				this.postRequest( post, 'html', function( html ) {
					this._getSubmitResults( html );
				}); 				
			} 			
		},
		
		/**
		 * @param 	data	string : xhr response text
		 */			
		_getSubmitResults : function ( data ) {
			var eventNode, result, parsedResult, response, args, argsobj, method;				
				response = $( data );				
				eventNode = response.find( this.name );
				argsobj = {result : eventNode.attr( 'result' ), message: eventNode.find( 'message' ).text().replace( exp_stripspace,'' )};
				if (this.options.resultSelector) {
					parsedResult = response.find( this.options.resultSelector );

					if ( this.options.resultFilter ) {
						result = $( parsedResult[0].innerHTML ).find( this.options.resultFilter ).parent()[0] || parsedResult[0];
					} else {
						result = parsedResult[0];
					}
					args = [ result.innerHTML.replace( exp_stripspace,'' ), argsobj ];
				} else {
					args = [ undefined, argsobj ];
				}										
				method = args[1].result === 'error' ? 'onSubmitError' : 'onSubmitSuccess';	
				this.options[ method ].apply( this.form, args );				
				this.options.onSubmitEnd.apply( this.form, [ this.fields ] );									
		},
		
		/**
		 * @param 	event	object eventdata 
		 * @param 	field	html input or texarea element
		 */		
		_onBlur : function ( event, field ) {
			var that = this,
				elem = event ? event.target : field,
				name = elem.nodeName.toLowerCase(),
				input = ( name === 'input' || name === 'textarea' ) ? $( elem ) : $(),
				post = this.getPostVars( input, this.action, name );
				
				
				if ( elem.type === 'submit' || elem.type === 'reset' ) {
					return;
				}
				//invoke validationStart callback
				this._onValidationStart( input );
				this.postRequest(post, function( xml ){
					this._postProcessValidation.apply( this, [ xml, input, !!field] );
					this._onValidationEnd( input );					
				});	
		},
		
		/**
		 * @param 	data	string : serialized form data
		 * @param 	mode	string : 'xml' or 'html || text'
		 * @param 	callback	function : function that is called after after xhr request was cemplete
		 */	
		_preProcessResponse : (function () {
			if ($.browser.msie) {
				return function( mode, data ){
					var xml;
					mode = mode || 'xml';
					if (mode === 'xml') {						
						xml = $(data)[0];
						xml = new ActiveXObject("Microsoft.XMLDOM");
						xml.async = false;
						xml.loadXML(data);						
					}
					
					else {
						xml = data;
					}
					return xml;
				};
			} else return function(mode, data){
				
				return data;
			};
		}()),
		postRequest : function( data, mode, callback ) {
			var that = this,indendedMode;
			if ( typeof mode === 'function' && !callback ) {
				callback = mode;mode = undefined;
			}
			
			if (!mode) {
				indendedMode = 'xml';
			}					   
			if ($.browser.msie && (!mode || mode === 'xml') ) {
				mode = 'text';
			}
			
			$.ajax({				
				url : this.options.url,				
				data : data,
				dataType : mode || 'xml',
				type : "POST",
				dataFilter : function ( response ) {					
					return that._preProcessResponse(indendedMode,response);
				},
				success : function ( response ) {					
					callback.call( that, response );
				},
				error : function ( response ) {
					callback.call( that, response );
				}
			});
		},
		
		/**
		 * @param 	elem 	DOMnode, input formelement 
		 * @param 	action 	name of submit action
		 * @param 	name	elem nodeName
		 */		
		getPostVars : function ( elem, action, name ) {	
			return ( ( name === 'input' || name === 'textarea' ) ? elem[0].name + '=' + elem[0].value : name === 'form' ?  elem.serialize()  :  '' ) + '&' + action;
		},
		
		/**
		 * Parses the response xml and checks if field is required
		 * and if it validates
		 * =====================================================
		 * @param 	data	xml document
		 * @param 	elem	DOMnode, formelement input
		 * @param 	prevalidate	bool
		 */		
		_postProcessValidation : function( data, elem, prevalidate ) {				
			var n = elem[0].name.match( exp_fieldname )[1],
				a = this.name, d = $( data ), e = d.find( 'events' ).find( a ),
				o, field = e.find( n ), mayFail = e.children().filter( n ),
				type, required ;				
				// check if out field does not colide width status message node
				if ( mayFail.length > 1 ) {
					for ( var i = 0, l = mayFail.length; i<l; i++ ) {
						if ( mayFail[i].getAttribute( 'type' ) ) {
							mayFail = $( mayFail[i] );
							field = mayFail;
							break;
						} 
					}
				}
				
				type = mayFail.attr( 'type' );
				if (prevalidate) {
					if (type === 'missing') {
						elem.data(this.nameSpace+'-field-required', true );
						this.requiredFields.push( elem );
					} 				
				}
				
				if ( ( type !=='missing' && type !=='invalid' ) ) {
					
					if (e.find( 'post-values' ).find( n )[0] ) { // is required field						
						required = true;
					}
					o = {validates : true};
					elem.data(this.nameSpace+'-field-validates', true );					
					!prevalidate && this.options.onValidationSuccess.apply( elem, [ o, field, required ] );
					
				} else {
				// if field has encountered an error					
					o = {validates : false, 
							error : e.text().replace( exp_stripspace ,''), 
							label : field.attr('label'), 
							type : field.attr('type'), 
							message : field.attr('message')
						};
					
					elem.data( this.nameSpace+'-field-validates', false );		
					
					!prevalidate && this.options.onValidationError.apply( elem, [ o, field ] );					
				}															
		},
		
		/**
		 * @param 	message		Object Literal, contains validation info
		 * @param 	name		field name
		 * @param 	required 	bool or undefined
		 */				
		onValidationSuccess : function( message, name, required ) {			
			if ( required ) {
				this.css( {borderColor:'greenyellow'} );	
			} else {
				this.css( {borderColor:''} );	
			}
		},
		
		/**
		 * @param 	message		Object Literal, contains validation info
		 * @param 	name		field name
		 */				
		onValidationError : function( message, name ) {
			this.css( {borderColor:'red'} );			
		},
		/**
		 * @param 	elem 	DOMnode, input formelement 
		 */
		
		_onValidationStart : function ( elem ) {			
			// e.g add loading class
			elem.addClass( 'loading' );
		},
		/**
		 * @param 	elem 	DOMnode, input formelement 
		 */		
		
		_onValidationEnd : function ( elem ) {
			elem.removeClass( 'loading' );
			// e.g remove loading class
		},
		
		/**
		 * comes in handy if you use the jQuery.events.destroyed
		 * plugin will teardown automatically
		 * =====================================================
		 */
		teardown : function () {
			
			
			this.form.unbind( 'detroyed', this.teardown );
			this.options.doSubmit && this.form.unbind( 'submit', this._onSubmit );
			this.form.undelegate( 'input, textarea', 'blur', this._onBlur );			
			
			this._destroy.call(this, this.form, this.nameSpace );		
			this._destroy.call(this, this.fields, this.nameSpace+'-field-validates' );
			
		},
		_destroy : function( elem, name ){
			elem.removeData( name );
		}
	};

	ValidationSubmit.prototype.defaults = {
		url:'',
		resultSelector : '', // string, jquery selector
		resultFilter : '', // string, jquery selector
		urlParamsField : '',     // comma seperated list of field selectors: additional url parameter form hidden fields, eg "[name*=entry], [name*=blogpost]"
		urlParamsFixedVars : '',          // comma seperated list , additional fixed url parameter "param1=foo,param2=baz"	
		onSubmitStart:function(){},
		onSubmitEnd:function(){},
		onSubmitSuccess:function(){},
		onSubmitError:function(){},
		submitLock : function () {},
		getSubmitResults : true,
		onValidationError:ValidationSubmit.prototype.onValidationError,
		onValidationSuccess : ValidationSubmit.prototype.onValidationSuccess
	};
	
	$.fn.SymphonyFormInlineValidate = function( options ) {
		return this.each( function() {
			$(this).data( ValidationSubmit.prototype.nameSpace, new ValidationSubmit(this, options) );
		});
	};
}(this.jQuery));