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
 * Version    Date            Author           Remarks
 * 1.00       10 Jul 2017     dgeronimo
 *
 */

/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/search','N/record','N/file','N/runtime','N/email'],
    function(search,record,file,runtime,email) {
	
	var HC_REBATE_TRAN_TYPE_NUM = {
	        31 : 'salesorder',
	        15 : 'purchaseorder',
	        16 : 'itemreceipt',
	        17 : 'vendorbill',
	        20 : 'vendorcredit',
	        43 : 'vendorreturnauthorization',
	        6 : 'estimate',
	        32 : 'itemfulfillment',
	        5 : 'cashsale',
	        7 : 'invoice',
	        33 : 'returnauthorization',
	        10 : 'creditmemo',
	        44 : 'workorder',
	        30 : 'customerrefund',
	        29 : 'cashrefund',
	        9 : 'customerpayment'
	};
	
	var REC_CREDITMEMO = "creditmemo";
	var REC_VENDOR_CREDIT = 'vendorcredit';
	var REC_RETURN_AUTH = 'returnauthorization';
	var REC_VENDOR_RETURN = 'vendorreturnauthorization';
	var REC_CASH_REFUND = 'cashrefund';
	var HC_NEGATIVE_REBATE_REC_TYPES = [REC_CREDITMEMO, REC_VENDOR_CREDIT, REC_RETURN_AUTH, REC_VENDOR_RETURN, REC_CASH_REFUND];
	//START: Search Utilities
    
    /**
     * this will validate is a Array/String/Object is empty or not
     * @param value the value to validate
     */
    function isEmpty(value){
        var bResult = false;            
        if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { bResult = true; }
        return bResult;
    }
    
    /**
     * this function will return the defaultValue if the object is Empty
     * @param object object of any type
     * @defaultValue the replacing value if the object is not set or empty
     */
    function isEmptyReplaceWith(object,defaultValue){
        if(isEmpty(object)){
            return defaultValue;
        }
        return object;
    }
    
    /**
     * this will get all result more than 1000
     * @param option: save search Option 
     * @param option.isLimitedResult
     * @return {result[]}
     */
    function searchGetAllResult(option){
        var result = [];
        if(option.isLimitedResult == true){
            var rs = search.create(option).run();
            result = rs.getRange(0,1000);
            
            return result;
        }
        
        var rp = search.create(option).runPaged();
        rp.pageRanges.forEach(function(pageRange){
            var myPage = rp.fetch({index: pageRange.index});
            result = result.concat(myPage.data);
        });
        
        return result;
    }
    
    /**
     * this will get all result more than 1000
     * @param option: save search Option 
     * @param option.isLimitedResult
     * @return {result[]}
     */
    function searchGetAllResultSrchObj(searchObject,option){
        
        if(isEmpty(option)){
            option = {};
        }
        
        var result = [];
        if(option.isLimitedResult == true){
            var rs = searchObject.run();
            result = rs.getRange(0,1000)
            
            return result;
        }
        
        var rp = searchObject.runPaged();
        rp.pageRanges.forEach(function(pageRange){
            var myPage = rp.fetch({index: pageRange.index});
            result = result.concat(myPage.data);
        });
        
        return result;
    }
    
    
    /**
     * this function will sort the search result by ASC
     * @param result array(search result) 
     * @param field string(name of the field to sort)
     */
    function searchSortResult(result,field){
        if(isEmpty(result) || isEmpty(field)){
            return [];
        }
        
        var arrResult = result.sort(function(a,b){
            var inta = a.getValue(field);
            var intb = b.getValue(field);
            return inta - intb;
        });
        
        return arrResult;
    }
    
    
    /**
     * @description load search with the ability to append additional or remove filters and columns.
     * @param option a regular search module for search.load
     * @param option.addFilters (array) this will hold the new appending filters
     * @param option.addColumns (array) this will hold the new appending Columns
     * @param option.removeFilters (array) remove the filter by colname or colname + operator or  colname + operator + filter value (not yet implemented)
     * @param option.removeColumns (array) remove the columns by colname (not yet implemented)
     * @param option.resultLimit (number)
     * @param option.resultStart (number)
     * @result Array of result
     */
    function searchLoad(option){
        if(isEmpty(option)){
            return null;
        }
        
        var objSearch = search.load({
            id: option.id,
        });
        
        if(!isEmpty(option.filters)){
            objSearch.filters = option.filters;
        }
        if(!isEmpty(option.columns)){
            objSearch.columns = option.columns;
                       
        }
        if(!isEmpty(objSearch.columns)){
            for(var i = 0; i < objSearch.columns.length; i++){

                
                if(!isEmpty(objSearch.columns[i].formula)){
                    var stName = objSearch.columns[i].name;
                    var stSummary = objSearch.columns[i].summary;
                    var stFormula = objSearch.columns[i].formula;
                    var stJoin = objSearch.columns[i].join;
                    var stFunction = objSearch.columns[i]['function'];
                    var stSort = objSearch.columns[i].sort;
                    var stSortdir = objSearch.columns[i].sortdir;
                    var stLabel = objSearch.columns[i].label;
                    var stLabelId = isEmptyReplaceWith(stLabel, '');
                        stLabelId = stLabelId.replace(/\s/g,'');
                        stLabelId = stLabelId.toLowerCase();

                    objSearch.columns[i] = search.createColumn({
                        name: stName + "_" + stLabelId + (i+1),
                        summary: stSummary,
                        join: stJoin,
                        label: stLabel,
                        'function': stFunction,
                        formula: stFormula,
                        sort: stSort,
                        sortdir: stSortdir
                    });
                }
            }
        }

        
        if(!isEmpty(option.addFilters)){
            var arrFil = objSearch.filters;
            arrFil = isEmpty(arrFil)? []: arrFil;
            
            objSearch.filters = arrFil.concat(option.addFilters);
        }
        
        if(!isEmpty(option.addColumns)){
            var arrCol = objSearch.columns;
            arrCol = isEmpty(arrCol)? []: arrCol;
            
            objSearch.columns = arrCol.concat(option.addColumns);
        }
        
        //log.debug('fddcol', JSON.stringify(objSearch.columns));
        var arrResult = [];
        var intStart  = 0;
        if(!isEmpty(option.resultStart))
            intStart = option.resultStart;
      
        if(!isEmpty(option.resultLimit)){

            option.resultLimit = parseInt(option.resultLimit);
            option.resultLimit = (option.resultLimit <= 0 )? 1000: option.resultLimit;
            arrResult = objSearch.run().getRange(intStart,option.resultLimit);
        }else{
            arrResult = searchGetAllResultSrchObj(objSearch, option);
        }
        
        //log.debug("SEARCHLOAD filters", JSON.stringify(objSearch.filters));
        //log.debug("SEARCHLOAD arrResult", JSON.stringify(arrResult));
        
        return {
            search: objSearch,
            result: arrResult,
        }
    }
	//END: 
	
    /**
     * this can be used in used in JSON parse search result string in lookupField where the field result can be array or( text,value) or single object of (text,value)
     * @param field: searchResultColumn on the search result
     */
    function getValue(field){
        if(isEmpty(field)){
            return "";
        }
        
        var retVal = "";
        
        if(field instanceof Array){
            retVal = [];
            for(var i in field){
                retVal.push(field[i].value);
            }
            retVal = retVal.join(',');
        }else{
            if(typeof(field) === "object"){
                retVal = field.value;
            }else{
                retVal = field;
            }
    
        }
        
        return retVal;
    }
    /**
     * this can be used in JSON parse search result string in lookupField where the field result can be array or( text,value) or single object of (text,value)
     * @param field: searchResultColumn on the search result
     */
    function getText(field){
        if(isEmpty(field)){
            return "";
        }
        
        var retVal = "";
        
        if(field instanceof Array){
            retVal = [];
            for(var i in field){
                retVal.push(field[i].text);
            }
            retVal = retVal.join(',');
        }else{
            if(typeof(field) === "object"){
                retVal = field.text;
            }else{
                retVal = field;
            }
    
        }
        
        return retVal;
    }
	
    function getInputData() {
        return search.load({
        	id: "customsearch_nsts_rm_rtd_for_nightly_tlr",
        })
    }
    
    function map(context) {
    	
    	log.debug({title: "MAP",details: context.value});
    	var bSupported  	= true;
        var searchResult	= JSON.parse(context.value);
        var stRTDId 		= searchResult.id;
        var stRA 			= getValue(searchResult.values["GROUP(custrecord_nsts_rm_rebatetran_agreement)"]);
        var stCustomer 		= getValue(searchResult.values["GROUP(custrecord_nsts_rm_tran_customer)"]);
        var stVendor 		= getValue(searchResult.values["GROUP(custrecord_nsts_rm_td_vendor)"]);
        
        var stItemEligible 	= getValue(searchResult.values["GROUP(custrecord_nsts_rm_eligible_item.CUSTRECORD_NSTS_RM_REBATETRAN_AGREEMENTD)"]);
        var stItem 			= getValue(searchResult.values["GROUP(custrecord_nsts_rm_rebate_item)"]);
        var stItemClass 	= getValue(searchResult.values["GROUP(custrecord_nsts_rm_rad_item_class.CUSTRECORD_NSTS_RM_REBATETRAN_AGREEMENTD)"]);
        var flQty			= getValue(searchResult.values["SUM(custrecord_nsts_rm_td_item_qty)"]); 
        var flItemCost		= getValue(searchResult.values["SUM(custrecord_nsts_rm_item_cost)"]);
        var stTranTypeId	= getValue(searchResult.values["GROUP(custrecord_nsts_rm_tran_type)"]); 
        var stTranType		= HC_REBATE_TRAN_TYPE_NUM[stTranTypeId];
                
        var stEntity 		= stCustomer;
        var stEntityType 	= "customer";
        if(isEmpty(stCustomer)){
        	stEntity = stVendor;
        	stEntityType = "vendor"
        }
        var arrClaimTrans = [];
        if(stRA){
        	try{
        		var objRec = record.load({
        		    type: 'customrecord_nsts_rm_rebate_agreement', 
        		    id: stRA
        		});
            	var arrClaimTrans = objRec.getValue('custrecord_nsts_rm_claim_transaction');   

        		log.audit('stRA',stRA);
        		log.audit('arrClaimTrans',JSON.stringify(arrClaimTrans));
        		var intstTranTypeId = parseInt(stTranTypeId);
        		log.audit('intstTranTypeId',intstTranTypeId);
        		var bFound = false;
        		for(var i =0;i<arrClaimTrans.length; i++){
            		var stClaimTranTypeId = parseInt(arrClaimTrans[i]);
            		if(stClaimTranTypeId == intstTranTypeId){

            			bFound = true;
            			break;
            		}
            	}
        		if(!bFound)
        			bSupported = false;

        		log.audit('bSupported',bSupported);
        	}catch(err){
        		log.audit('arrClaimTrans',err.toString())
        	}
        
        }
        
        if(bSupported){

            //Data definition for the individual RTD for the initial TLR item
            var objTRDData		= {
            		rtd: stRTDId,
            		ra: stRA,
            		entity: stEntity,
            		entityType: stEntityType,
            		item: stItem,
            		itemEligible: stItemEligible,
            		itemClass: stItemClass,
            		qty: flQty,
            		itemCost: flItemCost,
            		tranType: stTranType,
            		tranTypeId: stTranTypeId,
            		isItemClass: isEmpty(stItemClass)? false: true
            		
            }
            
            var stKey = "MAINKEY_ENTITY_" + stEntity + "_RA_" + stRA;

            var arrFilter = [];
            
            arrFilter.push(search.createFilter({name: 'custrecord_nsts_rm_tier_rebate_agreement', operator: 'anyof', values: stRA}));
            if(!isEmpty(stItemEligible)){
                arrFilter.push(search.createFilter({name: 'custrecord_nsts_rm_tg_item',join: "custrecord_nsts_rm_tier_tg", operator: 'anyof', values: stItemEligible}));
            }
            if(!isEmpty(stItemClass)){
                arrFilter.push(search.createFilter({name: 'custrecord_nsts_rm_tg_item_class',join: "custrecord_nsts_rm_tier_tg", operator: 'anyof', values: stItemClass}));
            }
            
            //arrFilter.push(['custrecord_nsts_rm_tier_rebate_agreement','anyof',stRA]);
            //arrFilter.push('and');
            
            var objSearch = searchLoad({
            	id: 'customsearch_nsts_rm_mr_get_tier_nightly',
            	addFilters: arrFilter,
            });
            
            var arrTierRes = objSearch.result;
            log.debug({title: "MAP ARRTIERRES",details: JSON.stringify(arrTierRes)});
        	var arrObjTier = {keys: []}; //this is a pointer to the keys MAINKEY_<ENTITY>_<RA>_<TG> for Data retrieval in REDUCE
        	var arrTierMatrix = [];
        	var stTG = "";
        	
        	//Construct the Initial TRL record information for the REDUCE to process and normalized 
            for(var i = 0; i < arrTierRes.length; i++){
            	var recTier = arrTierRes[i];
            	stTG = recTier.getValue("custrecord_nsts_rm_tier_tg");
            	var bAggregate = recTier.getValue({name: "custrecord_nsts_rm_tg_agg",join: "custrecord_nsts_rm_tier_tg" } );
            	var bfcTarget = recTier.getValue("custrecord_nsts_rm_tier_forecast_target");
            	var fMin = recTier.getValue("custrecord_nsts_rm_tier_minimum");
            	var fMax = recTier.getValue("custrecord_nsts_rm_tier_maximum");
            	var fPercent = recTier.getValue("custrecord_nsts_rm_tier_percent");
            	
            	var stKeyBuff = stKey + "_TG_" + stTG
            	if(isEmpty(arrObjTier[stKeyBuff])){
            		arrObjTier[stKeyBuff] = {
            				key: stKeyBuff,
            				ra: stRA,
            				tg: stTG,
            				aggregate: bAggregate,
            				forecastTarget: recTier.id,
            				entity: stEntity,
            				stEntityType: stEntityType,
            				item: null,
            				lowTier: 0,
            				highTier: 0,
            				lowTierId: null,
            				highTierId: null
            		};
            	}
            	
            	arrTierMatrix.push({
            		tg: stTG,
            		tier: recTier.id,
            		min: fMin,
            		max: fMax,
            		percentage: isEmpty(fPercent)? 0: fPercent
            		
            	});
            	
            	if(bfcTarget == true || bfcTarget == "T"){
            		arrObjTier[stKeyBuff].forecastTarget = recTier.id;
            	}
            	
            	arrObjTier[stKeyBuff].item = objTRDData;
            	
            	//add the unique keys
            	if(arrObjTier.keys.indexOf(stKeyBuff) < 0){
                	arrObjTier.keys.push(stKeyBuff);
            	}
            	
            }
            
            
            //get the proper Tier Matrix start from the target forecast
            var arrTierMatrixBuff = []
            for(var ix = 0; ix < arrObjTier.keys.length; ix++){
            	var onjTLR = arrObjTier[arrObjTier.keys[ix]];
            	
            	var bStrtForecast = false;
            	for(var iy = 0; iy < arrTierMatrix.length; iy++){
            		if(arrTierMatrix[iy].tier == onjTLR.forecastTarget){
            			bStrtForecast = true;
            		}
            		
            		if(bStrtForecast == true){
            			arrTierMatrixBuff.push(arrTierMatrix[iy]);
            		}
            	}
      
            	arrObjTier[arrObjTier.keys[ix]].lowTier = arrTierMatrixBuff[0].min;
            	arrObjTier[arrObjTier.keys[ix]].lowTierId = arrTierMatrixBuff[0].tier
            	
            	arrObjTier[arrObjTier.keys[ix]].highTier = arrTierMatrixBuff[(arrTierMatrixBuff.length-1)].max;
            	arrObjTier[arrObjTier.keys[ix]].highTierId = arrTierMatrixBuff[(arrTierMatrixBuff.length-1)].tier;
            }
            
            arrObjTier["tierMatrix"] = arrTierMatrixBuff;
            context.write(stKey + "_TG_" + stTG, arrObjTier);

        }else{
        	//context.write("", []);
        }    
    }
    
    /**
     * check if the TLR is already created
     */
    function getExistingTRFId(externalid){
        var arrFils     = [];
        arrFils.push(search.createFilter({
            name: 'externalid',
            operator: 'is',
            values: externalid}));
        arrFils.push(search.createFilter({
            name: 'isinactive',
            operator: 'is',
            values: false}));
        
        var arrCols 	= [];
        arrCols.push(search.createColumn({name: 'custrecord_nsts_rm_tlr_fcast_amt'}));
        
    	var arrRes = searchGetAllResult({
            type       : 'customrecord_nsts_rm_tlr',
            filters    : arrFils
            });
    	
    	if(isEmpty(arrRes)){
    		return null;
    	}else{
    		return arrRes[0].id;
    	}
    }
    
    function reduce(context) {
    	
    	var arrValues = context.values;
    	log.debug({title:"REDUCE ARRVALUES",details: arrValues});
    	
    	
    	var objFinalTLR = null;
    	var objAggregatedItems = {};
    	for(var ix = 0; ix < arrValues.length; ix++){
    		var objTLRBuff = JSON.parse(arrValues[ix]);
    		log.debug({title:"REDUCE objTLRBuff",details: objTLRBuff});
    		for (var iy = 0; iy < objTLRBuff.keys.length; iy++){
    			var stKEY = objTLRBuff.keys [iy];
    			
        		if(isEmpty(objFinalTLR)){
        			objFinalTLR = objTLRBuff[stKEY];
            		objFinalTLR["items"] = [];
            		objFinalTLR["aggregatedItems"] = {};
            		
            		objFinalTLR["tierMatrix"] = objTLRBuff.tierMatrix;

        		}
        		var objRTDItem = objTLRBuff[stKEY].item;
        		objFinalTLR["items"].push(objRTDItem);
        		var stKeyAgg = null;
        		if(objFinalTLR.aggregate == "false" || objFinalTLR.aggregate == false){
        			stKeyAgg = "ENTITY_" + objFinalTLR.entity + "_RA_" + objFinalTLR.ra + "_TG_" + objFinalTLR.tg; 
        			if(!isEmpty(objRTDItem.item)){
        				stKeyAgg += "_ITEM_" + objRTDItem.item;
        			}
        			
        			
        	        /**
        	         * fix for
        	         * B-57355
        	         * if(!isEmpty(objRTDItem.itemClass)){
        				stKeyAgg += "_ITEMCLASS_" + objRTDItem.itemClass;
        			}
        	         */

        			
        			
        			if(isEmpty(objAggregatedItems[stKeyAgg])){
        				objAggregatedItems[stKeyAgg] = {
        						item: [],
        						itemClass: [],
        						itemCost: 0//objRTDItem.itemCost
        				}
        			}
        			
        			if(!isEmpty(objRTDItem.item) && objAggregatedItems[stKeyAgg].item.indexOf(objRTDItem.item) < 0){
            			objAggregatedItems[stKeyAgg].item.push(objRTDItem.item)
        			}

        	        /**
        	         * fix for
        	         * B-57355
        	         * if(!isEmpty(objRTDItem.itemClass) && objAggregatedItems[stKeyAgg].itemClass.indexOf(objRTDItem.itemClass) < 0){
            			objAggregatedItems[stKeyAgg].itemClass.push(objRTDItem.itemClass)
        				}
        	         */

        			
        			var flItemCost = parseFloat(objRTDItem.itemCost);
        			if(HC_NEGATIVE_REBATE_REC_TYPES.indexOf(objRTDItem.tranType) >= 0){
        				flItemCost = parseFloat(objRTDItem.itemCost) * -1;
        			}
        			
        			objAggregatedItems[stKeyAgg].itemCost += flItemCost;
        		}else{
        			stKeyAgg = "ENTITY_" + objFinalTLR.entity + "_RA_" + objFinalTLR.ra + "_TG_" + objFinalTLR.tg;
        			
        			if(isEmpty(objAggregatedItems[stKeyAgg])){
        				objAggregatedItems[stKeyAgg] = {
        						item: [],
        						itemClass: [],
        						itemCost: 0
        				}
        			}
        			
        			if(!isEmpty(objRTDItem.item) && objAggregatedItems[stKeyAgg].item.indexOf(objRTDItem.item) < 0){
            			objAggregatedItems[stKeyAgg].item.push(objRTDItem.item)
        			}

        	        /**
        	         * fix for
        	         * B-57355
        	         * if(!isEmpty(objRTDItem.itemClass) && objAggregatedItems[stKeyAgg].itemClass.indexOf(objRTDItem.itemClass) < 0){
            			objAggregatedItems[stKeyAgg].itemClass.push(objRTDItem.itemClass)
        				}
        	         */

        			
        			var flItemCost = parseFloat(objRTDItem.itemCost);
        			if(HC_NEGATIVE_REBATE_REC_TYPES.indexOf(objRTDItem.tranType) >= 0){
        				flItemCost = parseFloat(objRTDItem.itemCost) * -1;
        			}
        			
        			objAggregatedItems[stKeyAgg].itemCost += flItemCost;
        		}
        		
        		//Aggregate each RTD into a group whether group by RA + TG + [ITEM || ITEMCLASS] (if the AGGREGATE is False) or RA + TG (if the AGGREGATE is true)
        		objFinalTLR["aggregatedItems"] = objAggregatedItems;
        		
        		//delete the objFinalTLR.item, individual RTD is already collected as objFinalTLR["items"]
        		delete objFinalTLR.item;
        		
    		}
    	}
    	

    	//START: GENERATING and UPDATING TLR Record base on the aggregated Items 
    	if(!isEmpty(objFinalTLR)){
    		for(var key in objFinalTLR.aggregatedItems){
    			var objItem = objFinalTLR.aggregatedItems[key];
    			
    			//START: DUMP DEBUGGING TEXT FILE
    			//Enable this to check the data
    			/*try{
        	    	var fileObj = file.create({
                	    name: key + '.txt',
                	    fileType: file.Type.PLAINTEXT,
                	    contents: JSON.stringify(objFinalTLR),
                	    folder: -9,
                	});
                	fileObj.save()
    			}catch(e){
    				
    			}*/
    			//END: DUMP DEBUGGING TEXT FILE
    			
    			var stTLRId = getExistingTRFId(key);
    			
    			//search for the current tier
    			var arrCurrentForecast = objFinalTLR.tierMatrix.filter(function(tier){
    				if(!isEmpty(tier.max)){
        				if(parseFloat(objItem.itemCost) >= parseFloat(tier.min) && parseFloat(objItem.itemCost) <= parseFloat(tier.max)){
        					return true
        				}
    				}else{
        				if(parseFloat(objItem.itemCost) >= parseFloat(tier.min)){
        					return true
        				}
    				}
    				
    			});
    			
    			var objCurrentForecast = {};
    			if(!isEmpty(arrCurrentForecast)){
    				objCurrentForecast = arrCurrentForecast[0];
    			}else{
    				
    				objFinalTLR.highTier = isEmpty(objFinalTLR.highTier)? objItem.itemCost: objFinalTLR.highTier;
    				
    				//if not found in the tier Matrix set the default forecast target 
    				//if the item cost is less than the min of the default forecast target 
    				//otherwise if greater that the max of the hightest tier in the TG, then set the current forecast to the hightest tier
    				if(parseFloat(objItem.itemCost) <= parseFloat(objFinalTLR.lowTier)){
    					arrCurrentForecast = objFinalTLR.tierMatrix.filter(function(tier){
    						if(tier.tier == objFinalTLR.lowTierId){
    							return true
    						}
    					});
    					objCurrentForecast = arrCurrentForecast[0];
    					
    				}else if(parseFloat(objItem.itemCost) >= parseFloat(objFinalTLR.highTier)){
    					arrCurrentForecast = objFinalTLR.tierMatrix.filter(function(tier){
    						if(tier.tier == objFinalTLR.highTierId){
    							return true
    						}
    					});
    					objCurrentForecast = arrCurrentForecast[0];
    				}
    					
    		        	//arrObjTier[arrObjTier.keys[ix]].highTier = arrTierMatrixBuff[(arrTierMatrixBuff.length-1)].max;
    	        		//arrObjTier[arrObjTier.keys[ix]].highTierId = arrTierMatrixBuff[(arrTierMatrixBuff.length-1)].tier;
    					objCurrentForecast
    			}
    			
    			
    			if(isEmpty(stTLRId)){
        			log.debug("CREATE TLR","key: " + key);
    	 	    	var objRecord = record.create({
        	    	    type: 'customrecord_nsts_rm_tlr', 
        	    	    isDynamic: true,
        	    	    
        	    	});
    	 	    	
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_ra",objFinalTLR.ra);
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_entity",objFinalTLR.entity);
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_tg",objFinalTLR.tg);
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_forecastarget",objFinalTLR.forecastTarget);
    	 	    	
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_item",objItem.item);
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_itemclass",objItem.itemClass);

    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_fcast_amt",objItem.itemCost);
    		    	objRecord.setValue("custrecord_nsts_rm_tlr_current_fcast",objCurrentForecast.tier);
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_fcast_percent",parseFloat(objCurrentForecast.percentage));
    	 	    	
    	 	    	objRecord.setValue("externalid",key);
    	 	    	objRecord.setValue("name",key);
    	 	    	
    	 	    	objRecord.save();
    	 	    	
    	 	        context.write("CREATED_TLR", key);
    			}else{
        			log.debug("UPDATE TLR","key: " + key + " stTLRId:" + stTLRId);
        			
    	 	    	var objRecord = record.load({
    	 	    		id: stTLRId,
        	    	    type: 'customrecord_nsts_rm_tlr'
        	    	    
        	    	});
    	 	    	
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_item",objItem.item);
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_itemclass",objItem.itemClass);
    	 	    	
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_fcast_amt",objItem.itemCost);
    		    	objRecord.setValue("custrecord_nsts_rm_tlr_current_fcast",objCurrentForecast.tier);
    	 	    	objRecord.setValue("custrecord_nsts_rm_tlr_fcast_percent",parseFloat(objCurrentForecast.percentage));
        			
    	 	    	objRecord.save();
    	 	    	
    	 	    	context.write("UPDATED_TLR", key);
        			/*var id = record.submitFields({
        			    type: 'customrecord_nsts_rm_tlr',
        			    id: stTLRId,
        			    values: {
        			    	custrecord_nsts_rm_tlr_fcast_amt: objItem.itemCost,
        			    	custrecord_nsts_rm_tlr_current_fcast: objCurrentForecast.tier,
        			    	custrecord_nsts_rm_tlr_fcast_percent: parseFloat(objCurrentForecast.percentage)
        			    }
        			});*/
        		}
    		}
    	}

		
		//END: GENERATING and UPDATING TLR Record

    	/*var fileObj = file.create({
    	    name: context.key + '.txt',
    	    fileType: file.Type.PLAINTEXT,
    	    contents: JSON.stringify(objFinalTLR),
    	    folder: -9,
    	});
    	fileObj.save()*/
    	
    	
    	
    }
    
    
    function summarize(summary) {   
  
        var OBJ_SCRIPT           = runtime.getCurrentScript();
        var ST_USER = OBJ_SCRIPT.getParameter({name: 'custscript_nsts_rm_nightly_tlr_user'});

        
        
        
    	var objSummaryData = null;
    	

    	
    	
    	summary.output.iterator().each(function (key, value){
    		log.debug({title:"SUMMARIZE",details: "KEY_" + key + ": " + value});
    		if(isEmpty(objSummaryData)){
    			objSummaryData = {};
    		}
    		
    		if(isEmpty(objSummaryData[key])){
    			objSummaryData[key] = [];
    		}
    		objSummaryData[key].push(value)
    		return true;
    	});
    	
    	var errKey = "ERROR_TLR";
    	summary.mapSummary.errors.iterator().each(function (key, error){
    		log.debug('Map Error for key: ' + key, error);
    		return true;
    	});
    	
    	summary.reduceSummary.errors.iterator().each(function (key, error){
    		log.debug('Reduce Error for key: ' + key, error);
    		if(isEmpty(objSummaryData)){
    			objSummaryData = {};
    		}
    		
    		if(isEmpty(objSummaryData[errKey])){
    			objSummaryData[errKey] = [];
    		}
    		objSummaryData[errKey].push(key + " : " +error)
    		return true;
    	});
    	
    	var stEmailBody = [];
    	
    	if(!isEmpty(objSummaryData)){
    		stEmailBody.push("<b>Summary Execution Report</b>");
        	stEmailBody.push("<br/>");
        	
        	stEmailBody.push("<table border=1>");
        	stEmailBody.push("<tr>");
			stEmailBody.push("<td>ACTION</td>");
			stEmailBody.push("<td>COUNT</td>");
			stEmailBody.push("</tr>");
        		for(var dKey in objSummaryData){
        			var arrData = objSummaryData[dKey];
        			stEmailBody.push("<tr>");
        			stEmailBody.push("<td>" + dKey + "</td>");
        			stEmailBody.push("<td>" + arrData.length + "</td>");
        			stEmailBody.push("</tr>");
        		}
        	
        	stEmailBody.push("</table>");
        	
        	stEmailBody.push("<br/><br/>");
        	stEmailBody.push("<b>Details</b>");
        	stEmailBody.push("<table border=1>");
        		for(var dKey in objSummaryData){
        			var arrData = objSummaryData[dKey];
        			stEmailBody.push("<tr>");
        			stEmailBody.push("<td>" + dKey + "</td>");
        			stEmailBody.push("<td>");
        			for(var i = 0; i < arrData.length; i++){
        				stEmailBody.push(arrData[i] + "<br/>");
        			}
        			stEmailBody.push("</td>");
        				
        			
        			
        			stEmailBody.push("</tr>");
        		}
        	
        	stEmailBody.push("</table>");
        	try{
            	email.send({
            	    author: ST_USER,
            	    recipients: ST_USER,
            	    subject: 'RM NIGHTLY FORECAST EXECUTION ' + (new Date()),
            	    body: stEmailBody.join("\n"),
					relatedRecords: {
						entityId: ST_USER
					}
            	});
        	}catch(e){
        		
        	}
    	}else{
    		log.debug('NO SUMMARY TO REPORT',"NO DATA To PROCESS");
    	}
    	
    }
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});