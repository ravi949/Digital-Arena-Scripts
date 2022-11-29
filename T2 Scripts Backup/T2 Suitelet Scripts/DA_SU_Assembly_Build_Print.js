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
			var params = context.request.parameters;
			
			var myTemplate = render.create();
			myTemplate.setTemplateByScriptId({
				scriptId : "CUSTTMPL_DA_ASSEMBLY_BUILD_TEMP"
			});
          log.debug('template',myTemplate);
			var objRec = record.load({
				type : 'assemblybuild',
				id :params.id
			});
          log.debug('objRec', objRec);
          var assemblyItem = objRec.getValue('item');
          log.debug('assemblyItem',assemblyItem);
          var itemRec = record.load({
          	type: 'lotnumberedassemblyitem',
          	id: assemblyItem,
          	isDynamic: true
          });
          var myItemArray=[];
          var lineCount = itemRec.getLineCount('member');
          log.debug('lineCount',lineCount);
          var totalQty=0;
          var count = 0;
          for(var i = 0; i < lineCount; i++){
          	var item = itemRec.getSublistText({
          		sublistId: 'member',
          		fieldId: 'item',
          		line: i
          	});
          	log.debug('item',item);
          	item = item.split(" ")[0];
          	log.debug('item',item);
            var itemId = itemRec.getSublistValue({
          		sublistId: 'member',
          		fieldId: 'item',
          		line: i
          	});
          	log.debug('itemId',itemId);
          	var description = itemRec.getSublistValue({
          		sublistId: 'member',
          		fieldId: 'memberdescr',
          		line: i
          	});
          	log.debug('description',description);
          	description = description.replace('&', '&amp;'); 
          	log.debug('description',description);
          	var quantity = itemRec.getSublistValue({
          		sublistId: 'member',
          		fieldId: 'quantity',
          		line: i
          	});
          	log.debug('quantity',quantity);
               var units = itemRec.getSublistText({
                    sublistId: 'member',
                    fieldId: 'memberunit',
                    line: i
               });
               log.debug('units',units);
          	totalQty = parseFloat(totalQty) + parseFloat(quantity);
          	count = parseFloat(count) + 1;
            var itemSearch = search.create({
        type: 'item',
        filters: ['internalid', 'anyof', itemId],
        columns: ['upccode']
    });
            var searchCount = itemSearch.runPaged().count;
            log.debug('searchCount',searchCount);
            var upcCode;
            itemSearch.run().each(function(result) {
              upcCode = result.getValue('upccode');
              log.debug('upcCode',upcCode);
            });
          	myItemArray.push({'item':item,'description':description,'quantity':quantity, 'units':units, 'count':count, 'upcCode':upcCode});
          }
          var obj = {totalQty:totalQty, count:count};
          log.debug('obj',obj);
          var myItemArrayObj = {
          	'myItemArray' : myItemArray
          }
          log.debug('myItemArrayObj',myItemArrayObj);

          myTemplate.addCustomDataSource({
				format : render.DataSource.OBJECT,
				alias : "objj",
				data : myItemArrayObj
			});
          myTemplate.addCustomDataSource({
              	format: render.DataSource.OBJECT,
             	alias: "obj",
             	data:obj
            });
			myTemplate.addRecord('record', objRec);
			
			var template = myTemplate.renderAsPdf();
			log.debug('template', template);
			context.response.writeFile(template, true);
    

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		onRequest : onRequest
	};

});