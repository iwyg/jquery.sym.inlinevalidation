# a htmlform inline validation plugin for the jQuery JavaScript Library in use of SYMPHONY-CMS

## WHAT IT DOES:

The jQuery.SymphonyFormInlineValidate Plugin is a good start if you want to inline-validate you submitting forms and inject results (e.g. comments ) asynchronously into the page.

All validation is done server-side by Symphonys validation machanism, so you will also get the original status messages (SymphonyFormInlineValidate takes care of this in a bounch of callback options).

NOTE: while the validation process is proceeded, a css class "loading" is added to the current input field, so you can take care of this in your css stylesheets (e.g, add an loadspinner.gif, etc)


## PREPERATION:

This example describes the case, that you do a submit form for e.g. blog comments.


- In Symphony create a new datasource that doubles your Existing Comment Section DS
- call it e.g. "Blog Comment Ajax"
- you may want to set an optional filter e.g {$entry} if you want to set additional url params on the submit javascript

- create a new datasource that doubles your Existing Blogpost Section DS
- call it e.g. "Blogpost Ajax"

- create a new page called e.g. "Comment Ajax Validate" 
- attach your submit event and the newly created datasources to it.
- the page-template.xsl could look like the example file ( template.xsl )

- your form could like the example form ( form.html );


## IMPLEMENTATION:

Please refer to the script comments and the example implementation file ( implementation.js ) for detailed information

## TODO:

- I haven't tested this script on form elements like check - and select-boxes, radiobuttons, though it should work on these too.

- <del>I haven't tested this script on IE < 9 and Opera</del>

- if you find any problems please let me know
