/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search','N/record','N/redirect'],

		function(ui, search, record, redirect) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} context
	 * @param {ServerRequest} context.request - Encapsulation of the incoming request
	 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try {
			var request = context.request;
			var response = context.response;
          log.debug('request');

			if (context.request.method === 'GET') {


				var form = ui.createForm({
					title: '&nbsp;'
				});				
				/*form.addSubmitButton({
					id : 'custpage_report_btn',
					label : 'Submit'
				});*/			

				var hideFld = form.addField({
                    id:'custpage_hide_buttons',
                    label:'not shown - hidden',
                    type: ui.FieldType.INLINEHTML
                });
                var htmlCOde = '<head>   </head> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"> <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">   <body>     <div class="container">       <div class="row">           <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center">  <p class="alignleft"><img src = "https://jothencosmetics.com/media/logo/websites/9/jothen_cosmetics_cropped_logo.png" class = "img-responsive" height="100" width="200" alt = "Online Training"></p> <p class="alignright1"> &nbsp;:-)</p> <p class="alignright">Here to Make You Smile </p>   </div>       </div><input type="color" value="#ff0000">  <div calss ="row"> <div class="form-group col-md-4 required">  <label class="form-label" id="nameLabel" for="name"></label>  <input type="text" class="form-control" id="firstname" name="firstname" placeholder="First Name *"  tabindex="2" required="true"> </div>  </div> <div calss ="row"><div class="form-group col-md-4 required">  <label class="form-label" id="nameLabel" for="name"></label>  <input type="text" class="form-control" id="lastname" name="lastname" placeholder="Last Name *"  tabindex="2" required="true"> </div></div><div calss ="row"><div class="form-group col-md-4">                       <label class="form-label" id="emailLabel" for="email"></label>                       <input type="email" class="form-control" id="email" name="email" placeholder="Your Email *" tabindex="2" required="required">                     <i>Same Email you used to place your order</i>                   </div>    </div>  <div calss ="row">           <div class="form-group col-md-4">  <label class="form-label" id="phoneLabel" for="phone"></label>                       <input type="tel" pattern=".{8}" class="form-control" id="phone" name="phone" placeholder="Your Phone No *" tabindex="2" required="required">               </div>    </div>     <div calss ="row">              <div class="form-group col-md-4">                       <label class="form-label" id="orderLabel" for="text"></label>                       <input type="phone" class="form-control" id="orderid" name="orderno" placeholder="Order #" tabindex="2">                     <p><i>Help Us Reply Quickly<i></p>                   </div>       </div>          <div calss ="row">          <div class="form-group col-md-4">    <label for="sel1"></label>                      <select class="form-control" name = "sel1" id="sel1" required>          <option value="">Choose Topic *</option>';
                //for every button you want to hide, modify the scr += line
                var customrecord_da_case_typesSearchObj = search.create({
   type: "customrecord_da_pay_grades",
   filters:
   [
   ],
   columns:
   [
      search.createColumn({
         name: "internalid",
         sort: search.Sort.ASC,
         label: "Name"
      }),
      search.createColumn({
         name: "name",
         label: "Name"
      }),
      search.createColumn({name: "scriptid", label: "Script ID"})
   ]
});
var searchResultCount = customrecord_da_case_typesSearchObj.runPaged().count;
//log.debug("customrecord_da_case_typesSearchObj result count",searchResultCount);
customrecord_da_case_typesSearchObj.run().each(function(result){
   var caseType = result.getValue('name');
  log.debug('caseType',caseType);
   htmlCOde += '<optgroup label="' + caseType + '">';
  var customrecord_da_related_quireiesSearchObj = search.create({
   type: "customrecord_da_grade_business_trip",
   filters:
   [
      ["custrecord_da_grade_buss","anyof",result.id]
   ],
   columns:
   [
      search.createColumn({
         name: "internalid",
         sort: search.Sort.DESC,
         label: "Name"
      }),
      search.createColumn({
         name: "custrecord_da_country_buss",
         label: "Name"
      }),
      search.createColumn({name: "scriptid", label: "Script ID"})
   ]
});
var searchResultCount = customrecord_da_related_quireiesSearchObj.runPaged().count;
//log.debug("customrecord_da_related_quireiesSearchObj result count",searchResultCount);
customrecord_da_related_quireiesSearchObj.run().each(function(result){
  htmlCOde += '<option value='+result.id+'>'+result.getValue('custrecord_da_country_buss')+'</option>';
   return true;
});
   htmlCOde += '</optgroup>';
   return true;
});
                htmlCOde += ' </select>                          <br></div>                   <div class="form-group">                       <label class="form-label" id="messageLabel" for="message"></label>                       <textarea rows="6" cols="60" name="message" class="form-control" id="message" placeholder="Your message *" tabindex="4" required="required"></textarea>                                                    </div>         <div class="text-center "> <b><i>If you have already submitted a case regarding your request, please do not submit another one; as it may delay the process of us responding to you. You can simply reply to the email you have received regarding your case and we will receive your new comments.</i></b>    </div>   <div class="text-center "> &nbsp;</div>    <div class="text-center "> &nbsp;</div>     <div class="text-center margin-top-25">                       <button type="submit" class="btn btn-mod btn-border btn-large">Submit  Message</button>                   </div>                      </form><!-- End form -->           </div><!-- End col -->       </div><!-- End row -->     </div><!-- End container -->   </body><!-- End body -->';
                var scr = "";

                var css = 'input[type="text"]{    font-size:14px;}.pt_title {    left: 0 !important;    margin-bottom: 15px;    background-color: #A89787;}.btn{border: 1px solid transparent;border-radius: 4px;   background-color: #A89787;    font-weight: bold;}.alignleft {	float: left;}.alignright1 {	float: right;font-size: 40px;  font-weight: bold; }.alignright {	float: right;font-size: 40px;  font-weight: bold;  font-style: italic;}#success-message {   opacity: 0; .col-xs-12.col-sm-12.col-md-12.col-lg-12 {   padding: 0 20% 0 20%; .margin-top-25 {   margin-top: 25px; .form-title {   padding: 25px;   font-size: 45px;   font-weight: 300;   font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; .form-group .form-control {   -webkit-box-shadow: none;   border-bottom: 1px;   border-style: none none solid none;   border-radius:0;    border-color: #000; .form-group .form-control:focus { 	box-shadow: none;   border-width: 0 0 2px 0;   border-color: #000; .form-group.required .control-label:after {   content:"*";   color:red; textarea {   resize: none; .btn-mod.btn-large {     height: auto;     padding: 13px 52px;     font-size: 15px; .btn-mod.btn-border {     color: #000000;     border: 1px solid #000000;    background-color: #f44336;  color: white; .btn-mod, a.btn-mod {     -webkit-box-sizing: border-box;     -moz-box-sizing: border-box;     box-sizing: border-box;     padding: 4px 13px;     color: #fff;     background: rgba(34,34,34, .9);     border: 1px solid transparent;     font-size: 11px;     font-weight: 400;     text-transform: uppercase;     text-decoration: none;     letter-spacing: 2px;     -webkit-border-radius: 0;     -moz-border-radius: 0;     border-radius: 0;     -webkit-box-shadow: none;     -moz-box-shadow: none;     box-shadow: none;     -webkit-transition: all 0.2s cubic-bezier(0.000, 0.000, 0.580, 1.000);     -moz-transition: all 0.2s cubic-bezier(0.000, 0.000, 0.580, 1.000);     -o-transition: all 0.2s cubic-bezier(0.000, 0.000, 0.580, 1.000);     -ms-transition: all 0.2s cubic-bezier(0.000, 0.000, 0.580, 1.000);     transition: all 0.2s cubic-bezier(0.000, 0.000, 0.580, 1.000); .btn-mod.btn-border:hover, .btn-mod.btn-border:active, .btn-mod.btn-border:focus, .btn-mod.btn-border:active:focus {     color: #fff;     border-color: #000;     background: #000;     outline: none; @media only screen and (max-width: 500px) {     .btn-mod.btn-large {        padding: 6px 16px;        font-size: 11px;     .form-title {         font-size: 20px;}}';
               // scr += 'jQuery("#newrec102").hide();';
                //scr += 'jQuery("#recmachcustrecord_issue_material_child_remove").hide();';
                //push the script into the field so that it fires and does its handy work
                 
              hideFld.defaultValue = "<html>"+htmlCOde+"<style>"+css+"</style></html><script type='text/javascript'></script>"; 
               hideFld.defaultValue = "<html><style></style></html><script type='text/javascript'> document.getElementById('main_form').reset();</script>";
               hideFld.defaultValue = "<html>"+htmlCOde+"<style>"+css+"</style></html><script type='text/javascript'></script>";


				context.response.writePage(form);

				form.clientScriptModulePath = './DA_CS_Setup_Batch.js';
			}else{
              //log.debug("Post", request);
              var params = request.parameters;
              //log.debug('name', params.firstname+" ," + params.lastname +"," + params.email +"," + params.phone +" ,"+ params.message + ", " + params.sel1);
              var customerSearchObj = search.create({
				   type: "customer",
				   filters:
				   [
				      ["email","is",params.email]
				   ],
				   columns:
				   [
				      search.createColumn({name: "internalid", label: "Internal ID"})
				   ]
				});
				var searchResultCount = customerSearchObj.runPaged().count;
				//log.debug("customerSearchObj result count",searchResultCount);
				var customerId ;
              if(searchResultCount > 0){
				customerSearchObj.run().each(function(result){
				   customerId = result.id;
				   return true;
				});
              }else{
                customerId = 322;
              }

				var caseType = params.sel1;
				var caseId;

				var caserec = record.load({
					type:'customrecord_da_related_quireies',
					id: caseType
				})
                var caseParentId = caserec.getValue('custrecord_da_parent_case_type');
              var subText = caserec.getText('custrecord_da_parent_case_type');
				//log.debug('subText',subText);

              var caseRec =  record.create({
              	type:'supportcase'
              });
              caseRec.setValue('incomingmessage', params.message);
              caseRec.setValue('title', subText);
              if(customerId){
              	caseRec.setValue('company',customerId);
              
              
              caseRec.setValue('email', params.email);
              caseRec.setValue('custevent4', params.firstname);
              caseRec.setValue('custevent6', params.lastname);
              caseRec.setValue('custevent10', caseParentId);
              caseRec.setValue('custevent11', caseType);
                caseRec.setValue('phone', params.phone);
              caseRec.setValue('status', 1);
              caseRec.setValue('custevent3',params.orderno);
               caseId = caseRec.save({
              	enableSourcing : false,
              	ignoreMandatoryFields : true
              });
              }

              if(caseId){
              /*  var form = ui.createForm({
					title: '&nbsp;'
				});	
                var hideFld = form.addField({
                    id:'custpage_hide_buttons',
                    label:'not shown - hidden',
                    type: ui.FieldType.INLINEHTML
                });
                
                 hideFld.defaultValue = "<html><script type='text/javascript'>window.close();</script></html>";
                
                redirect.redirect({
                    url: 'https://jothencosmetics.com/'
                });*/
                var caseNo = record.load({
							type: 'supportcase',
							id: caseId
			}).getValue('casenumber');
						log.debug('Case details', caseId + "time:" + new Date());
						var responseHtml = '<div class="header-custom email-signup-thankyou">   <div class="content">     <div class="left-hole"></div>     <div class="right-hole"></div>     <div class="main-content">       <h2>Thank You , Your Request has been Recieved </h2> <h2>An Email with the case details is being forwarded to you</h2>      <p align ="left"><b>Please note down your request Id : ' + caseNo + ' to communicate further.</b></p>          </div>  <button type="submit"  onclick="return goHome()">Go To Home</button>  </div> </div><script>function goHome() {  window.open("https://jothencosmetics.com/");}</script>';
						var css = '@import url(//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css); .email-signup-thankyou{   font-family:sans-serif;   display: flex;   justify-content: center;   align-items: center;   color: #fff;   background: #333;   padding:10%;   .content{     margin: auto;  /* Magic! */     max-width:700px;     color:#333;     box-shadow: 0 3px 6px rgba(0,0,0,0.55), 0 3px 6px rgba(0,0,0,0.23);     background:url("https://i.giphy.com/media/U3qYN8S0j3bpK/giphy.webp") no-repeat #fff;     background-position: right 5px bottom 5px;     background-size: 10em;     text-align:center;     position: relative;     padding:10%;     border-radius:5px;     .left-hole,.right-hole{       position: absolute;       width:20px; height:20px;       background:#333;       border-radius:50%;       top:15px;     .left-hole{       left:15px;       top:10px;     .right-hole{       right:15px;       top:10px;     h2,h3{       text-align:left;       padding:5% 5% 0% 3%;       color:#333;       font-weight:900;     .main-content{       > h1 {         color:#333;         text-transform:uppercase;         margin-top:-2%;         font-size:2.5em;         font-weight:900;';
				var html = '<html>' + responseHtml + '<style>' + css + '</style></html>';
						response.write(html);
					} else {
						var responseHtml = '<div class="header-custom email-signup-thankyou">   <div class="content">     <div class="left-hole"></div>     <div class="right-hole"></div>     <div class="main-content"><h3><p align ="center">Sorry Your Details are not matching with our Database.</p></h3> </div>   <button type="submit"  onclick="return goBack()">Go Back</button></div></div><script>function goBack() {  window.history.back();}</script>';
						var css = '@import url(//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css); .email-signup-thankyou{   font-family:sans-serif;   display: flex;   justify-content: center;   align-items: center;   color: #fff;   background: #333;   padding:10%;   .content{     margin: auto;  /* Magic! */     max-width:700px;     color:#333;     box-shadow: 0 3px 6px rgba(0,0,0,0.55), 0 3px 6px rgba(0,0,0,0.23);     background:url("https://i.giphy.com/media/U3qYN8S0j3bpK/giphy.webp") no-repeat #fff;     background-position: right 5px bottom 5px;     background-size: 10em;     text-align:center;     position: relative;     padding:10%;     border-radius:5px;     .left-hole,.right-hole{       position: absolute;       width:20px; height:20px;       background:#333;       border-radius:50%;       top:15px;     .left-hole{       left:15px;       top:10px;     .right-hole{       right:15px;       top:10px;     h2,h3{       text-align:left;       padding:5% 5% 0% 3%;       color:#333;       font-weight:900;     .main-content{       > h3 {         color:red;     margin-top:-2%;         font-size:2.5em;         font-weight:900;';
						var html = '<html>' + responseHtml + '<style>' + css + '</style></html>';
						response.write(html);
             
              }

             // form.clientScriptModulePath = './DA_CS_Setup_Batch.js'
              
            }			

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	function myFunction() {
		log.debug('h');
	}

	

	

	return {
		onRequest: onRequest
	};

});