/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * This script is used for disabling, enabling and hiding of fields.
 * Also includes server side validation for Rebate Agreement.
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 May 2017     pdeleon   Initial version.
 * 
 */

function procTierLevelReference_BeforeSubmit(type) {
	var arrMsg = [];
	
	var idRec = nlapiGetRecordId();
	var idAgreement = nlapiGetFieldValue(FLD_TIER_REFERENCE_REBATE_AGREEMENT);
	var idEnt = nlapiGetFieldValue(FLD_TIER_REFERENCE_CUST_VEND);
	var idTierGroup = nlapiGetFieldValue(FLD_TIER_REFERENCE_TIER_GROUP);
	var idItem = nlapiGetFieldValue(FLD_TIER_REFERENCE_ITEM);
	var idItemClass = nlapiGetFieldValue(FLD_TIER_REFERENCE_ITEM_CLASS);
	
	if (checkHasDuplicateTLR(idRec, idAgreement, idEnt, idTierGroup, idItem, idItemClass)) {
		arrMsg.push('Tier Level Reference record already exists for the combination of Rebate Agreement, Customer/Vendor, Tier Group, and Item/Item Classification');
	}
	
	if (!isEmpty(arrMsg)) {
		throw nlapiCreateError('Error', arrMsg.join('</br>') , true);
	}
}