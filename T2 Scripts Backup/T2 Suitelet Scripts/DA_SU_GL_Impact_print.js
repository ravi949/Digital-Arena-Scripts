/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define([ 'N/render', 'N/record', 'N/file', 'N/search', 'N/format' ],

function(render, record, file, search, format) {

	/**
	 * Definition of the Suitelet script trigger point.
	 * 
	 * @param {Object}
	 *            context
	 * @param {ServerRequest}
	 *            context.request - Encapsulation of the incoming request
	 * @param {ServerResponse}
	 *            context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		try {
            log.debug('onRequest : ');

    		var id =context.request.parameters.id;
            //log.debug('id : ', id);

    		var type =context.request.parameters.type;
            //log.debug('type : ', type);
			var myTemplate = render.create();
          var objRec = record.load({
				type : type,
				id : id
			});
          var customerName = objRec.getText('entity');

          var customerId = objRec.getValue('entity');
          log.debug('customerId',customerId);
          if(type == "invoice" || type == "customerpayment")
          {
          	var paidTo = "Received From";
          	
          }
         else if(type == "advintercompanyjournalentry")
          {
          	var paidTo = "";
          	var customerName = "";
          }
          else
          {
          	var paidTo = "Paid To";
          }
          if(type == "customerpayment")
          {
          	var customerName = objRec.getText('customer');
          	 customerName = customerName.replace("&","&amp;");
          }
           if(type == "vendorbill")
          {
          	var customerName = objRec.getText('entity');
          	 customerName = customerName.replace("&","&amp;");
          }

          var subsidiary = objRec.getText('subsidiary');
           //log.debug('subsidiary',subsidiary);
				myTemplate.setTemplateByScriptId({scriptId : "CUSTTMPL_DA_3DP_GL_IMPACT"});
             var lineCount = objRec.getLineCount('recmachcustrecord_da_gl_impact_created_from');
             //log.debug('lineCount',lineCount);
             var accountArray=new Array();
             var creditTotal = 0;
             var debitTotal =0;
             for(var i=0;i<lineCount;i++)
             {

             	var account = objRec.getSublistText({
             		sublistId: 'recmachcustrecord_da_gl_impact_created_from',
                        fieldId: 'custrecord_da_gl_account',
                        line: i
                    });

             	var account1 = account.search("&");
             	log.debug('account1',account1);
             	if( account1 > 0)
             	{
                  log.debug("account1 > 0");
             		 account = account.replace("&","&amp;")
             	}
             	log.debug('account',account);
             	log.debug('account1',account1);
             	var debit = objRec.getSublistValue({
             		sublistId: 'recmachcustrecord_da_gl_impact_created_from',
                        fieldId: 'custrecord_da_gl_debit',
                        line: i
                    });
             	if(debit)
             	{
                 var debit = (Number(debit).toFixed(3));
             	}
             	else{
             		debit = 0;
             	}
             	 debitTotal = parseFloat(debitTotal) + parseFloat(debit);
             	debitTotal = debitTotal.toFixed(3);
             	var credit = objRec.getSublistValue({
             		sublistId: 'recmachcustrecord_da_gl_impact_created_from',
                        fieldId: 'custrecord_da_gl_credit',
                        line: i
                    });
             	if(credit)
             	{
                 var credit = (Number(credit).toFixed(3));
             	}
             	else{
             		credit = 0;
             	}
                 
                  creditTotal = parseFloat(creditTotal) + parseFloat(credit);
                 creditTotal = creditTotal.toFixed(3);
             	var memo = objRec.getSublistText({
             		sublistId: 'recmachcustrecord_da_gl_impact_created_from',
                        fieldId: 'custrecord_da_gl_memo',
                        line: i
                    });
             	var memo1 = memo.search("&");
             	if( memo1 > 0)
             	{
             		 memo = memo.replace("&","&amp;")
             	}
             	//log.debug('memo1',memo1);
             	accountArray.push({'rowNo':i+1,'account':account,'debit':debit,'credit':credit,'memo':memo});
             }
             var obj = {customerName:customerName,paidTo:paidTo,type:type,subsidiary:subsidiary,debitTotal:debitTotal, creditTotal:creditTotal};
           // log.debug('obj',obj);
			
             var accountArrayObjj = {
	  				"accountArray":accountArray
	  			}
              
			myTemplate.addRecord('record', objRec);
			myTemplate.addCustomDataSource({
				format : render.DataSource.OBJECT,
				alias : "objj",
				data : accountArrayObjj
			});
		
			 myTemplate.addCustomDataSource({
              format: render.DataSource.OBJECT,
             alias: "obj",
             data:obj
              });
			var template = myTemplate.renderAsPdf();
			log.debug('template', template);
			
			context.response.writeFile(template, true);
			
		}
		catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};
});