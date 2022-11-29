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
            log.debug('id : ', id);

    		var type =context.request.parameters.type;
            log.debug('type : ', type);
			var myTemplate = render.create();
          var objRec = record.load({
				type : type,
				id : id
			});
          if(type =="customtransaction_da_loan_issuance")
          {
          	var recType = "Loan Issuance";
          }
          else if(type == "customtransaction_da_loan_settlement")
          {
          	var recType = "Loan Payment";
          }
          else if(type == "custompurchase_da_loan_upfront_fees")
          {
            var recType = "Loan Upfront Fee";
          }
          else if(type == "customtransaction_da_loan_interest_payme")
          {
            var recType = "Loan Interest Payment";
          }
          else if(type == "customtransaction_da_loan_accrued_intere")
          {
            var recType = "Loan Accured Interest";
          }
          else if(type == "custompurchase_da_bond_upfront_fees")
          {
            var recType = "Bond Upfront Fee";
          }
          else if(type == "customtransaction_da_bond_accrued_intere")
          {
            var recType = "Bond Accured Interest";
          }
          else if(type == "customtransaction_da_bond_interest_payme")
          {
            var recType = "Bond Interest Payment";
          }
          else if(type == "customtransaction_da_call_option")
          {
            var recType = "Call Option";
          }
          else if(type == "customtransaction_da_bond_issuance")
          {
            var recType = "Bond Isuuance";
          }
           else if(type == "customtransaction_da_purchase_of_additio")
          {
            var recType = "Purchase of Additional Shares";
          }
           else if(type == "customtransaction_da_investment_acquisit")
          {
            var recType = "Investment Acquisition";
          }
           else if(type == "customtransaction_da_dividends_receivabl")
          {
            var recType = "Dividends Receivable";
          }
           else if(type == "customtransaction_da_record_dividends")
          {
            var recType = "Dividends Received";
          }
           else if(type == "customtransaction_da_invt_reassessment")
          {
            var recType = "Investment Reassessment";
          }
          else if(type == "customtransaction_da_gain_investment_sal")
          {
            var recType = "Sale of Investment";
          }
          
          var subsidiary = objRec.getText('subsidiary');
           log.debug('subsidiary',subsidiary);
				myTemplate.setTemplateByScriptId({scriptId : "CUSTTMPL_DA_LOANS_3DP_IMPACT"});
             var lineCount = objRec.getLineCount('recmachcustrecord_da_gl_impact_created_from');
             log.debug('lineCount',lineCount);
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
             		 account = account.replace("&","&amp;")
             	}
             	log.debug('account',account);
             	
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
             	var memo = objRec.getSublistValue({
             		sublistId: 'recmachcustrecord_da_gl_impact_created_from',
                        fieldId: 'custrecord_da_gl_memo',
                        line: i
                    });
             	accountArray.push({'rowNo':i+1,'account':account,'debit':debit,'credit':credit,'memo':memo});
             }
             var obj = {recType:recType,subsidiary:subsidiary,debitTotal:debitTotal, creditTotal:creditTotal};
            log.debug('obj',obj);
			
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