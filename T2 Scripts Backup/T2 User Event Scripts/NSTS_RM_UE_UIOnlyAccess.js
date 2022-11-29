/**
 * Copyright (c) 1998-2015 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * Script for disabling CSV Import, Web Service, and Mass Update access to the record
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Aug 2015     pdeleon	Initial version.
 * 
 */

/**
 * Throws an error if the record is accessed via CSV Import, Web Service, or 
 * Mass Update
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @return {void}
 */
function UIOnly_beforeSubmit(type) {
    var stContext = nlapiGetContext().getExecutionContext();
    
    // Record can only be accessed by UI
    if (stContext == HC_EXECTYPE_CSV_IMPORT ||
            stContext == HC_EXECTYPE_WEB_SERVICE ||
            stContext == HC_EXECTYPE_MASS_UPD) {
        throw nlapiCreateError('Error', 'Record cannot be added/updated thru the ' + stContext, true);
    }
    
    
    if(stContext == HC_EXECUTION_CONTEXT.userevent && type == HC_MODE_TYPE.Xedit){
    	if(nlapiGetRecordType() == REC_TRANSACTION_DETAIL){
    		var flRebateAmt = nlapiGetFieldValue(FLD_REBATE_TRAN_DETAIL_REBATE_AMT);
    		var flTotalRebateAmt = nlapiGetFieldValue(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT);
    		
    		var rec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
    		var flRebateQty = rec.getFieldValue(FLD_REBATE_TRAN_DETAIL_REBATE_QUANTITY);

    		var objRA = nlapiLookupField(REC_REBATE_AGREEMENT,rec.getFieldValue(FLD_CUSTRECORD_TRANS_AGREEMENT),['custrecord_nsts_rm_is_tiered_ra'])
    		var bIsTier = objRA.custrecord_nsts_rm_is_tiered_ra;
    		
    		var stClaim = rec.getFieldValue(FLD_CUSTRECORD_NSTS_REBATE_CLAIM);
    		
    		var validateIfHasClaim = function(){
        		if(!isEmpty(stClaim)){
        			throw "You cannot chnage the REBATE PER UNIT\/TOTAL REBATE if the RTD has an existing Claim!";
        		}
        		return true;
    		}
    		
    		var validateIsNegativeFunc = function(amt){
    			validateIfHasClaim();
    			
    			var stRecType = rec.getFieldValue(FLD_REBATE_TRAN_DETAIL_TRAN_TYPE);
    			var stTranType = HC_REBATE_TRAN_TYPE_NUM[stRecType];

    			log("DEBUG", 'UIONLY_BEFORESUBMIT', "stRecType: " + stRecType + " stTranType:" + stTranType + " amt:" + amt);
                if (HC_NEGATIVE_REBATE_REC_TYPES.indexOf(stTranType) > -1) {
                	if(amt > 0){
                		throw "New value cannot be greater than zero. Please check and try again.";
                	}
                	return true;
                }else{
                	if(amt < 0){
                		throw "New value cannot be less than zero. Please check and try again.";
                	}
                }
                
                return false;
    		}
    		

    		
    		if(bIsTier == "T"){    			
    			flRebateQty = 1;
    		}
    		
    		if(isEmpty(flRebateAmt)){
    			nlapiSetFieldValue(FLD_REBATE_TRAN_DETAIL_REBATE_AMT, 0);
    		}
    		
    		if(isEmpty(flTotalRebateAmt)){
    			nlapiSetFieldValue(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT, 0);
    		}
    		
    		

    		
    		if(!isEmpty(flRebateAmt)){
    			flRebateAmt = parseFloat(flRebateAmt);
    			var isNegative = validateIsNegativeFunc(flRebateAmt);
        		if(bIsTier == "T" && isNegative == true){    			
        			flRebateQty = -1;
        		}
    			
    			flRebateAmt *= parseFloat(flRebateQty);
    			if(isNegative == true){
    				flRebateAmt *= -1;
    			}
    			nlapiSetFieldValue(FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT, flRebateAmt);
    			
    			log("DEBUG", 'UIONLY_BEFORESUBMIT', "FLD_REBATE_TRAN_DETAIL_TOTAL_REBATE_AMT: " + flRebateAmt)
    		}
    		
    		if(!isEmpty(flTotalRebateAmt)){
    			flTotalRebateAmt = parseFloat(flTotalRebateAmt);
    			var isNegative = validateIsNegativeFunc(flTotalRebateAmt);
        		if(bIsTier == "T" && isNegative == true){    			
        			flRebateQty = -1;
        		}
    			flTotalRebateAmt /= parseFloat(flRebateQty);
    			if(isNegative == true){
    				flTotalRebateAmt /= -1;
    			}
    			nlapiSetFieldValue(FLD_REBATE_TRAN_DETAIL_REBATE_AMT, flTotalRebateAmt);
    			log("DEBUG", 'UIONLY_BEFORESUBMIT', "FLD_REBATE_TRAN_DETAIL_REBATE_AMT: " + flTotalRebateAmt)
    		}
    		
    		

    	}
    }
    
}
