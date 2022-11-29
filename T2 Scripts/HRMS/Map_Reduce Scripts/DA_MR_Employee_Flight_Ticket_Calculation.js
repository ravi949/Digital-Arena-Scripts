/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope TargetAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format'],

		function(record, search, runtime, format) {

	/**
	 * Marks the beginning of the Map/Reduce process and generates input data.
	 *
	 * @typedef {Object} ObjectRef
	 * @property {number} id - Internal ID of the record instance
	 * @property {string} type - Record type id
	 *
	 * @return {Array|Object|Search|RecordRef} inputSummary
	 * @since 2015.1
	 */
	function getInputData() {
		//Getting payrun scheduling record with filter processing checkbox is true
		try {

			var empRecId = runtime.getCurrentScript().getParameter({name:"custscript_flight_ticket_emp_id"});
			log.debug('recId',empRecId);

			if(empRecId){
				var customrecord_da_flight_tkt_allow_detailsSearchObj = search.create({
					type: "customrecord_da_flight_tkt_allow_details",
					filters:
						[
							["custrecord_da_flight_tkt_employee","anyof",empRecId]
							]
				});
				var searchResultCount = customrecord_da_flight_tkt_allow_detailsSearchObj.runPaged().count;
				log.debug("customrecord_da_flight_tkt_allow_detailsSearchObj result count",searchResultCount);
				customrecord_da_flight_tkt_allow_detailsSearchObj.run().each(function(result){
					record.delete({
						type:'customrecord_da_flight_tkt_allow_details',
						id:result.id
					})
					return true;
				});
				
				return search.create({
					type: "employee",
					filters:
						[
							["custentity_da_employee_grade","noneof","@NONE@"],
							"AND", 
						    ["internalid","anyof",empRecId]
							],
							columns:
								[
									search.createColumn({name: "internalid", label: "Internal ID"})
									]
				});
			}else{
				var customrecord_da_flight_tkt_allow_detailsSearchObj = search.create({
					type: "customrecord_da_flight_tkt_allow_details"				   
				});
				var searchResultCount = customrecord_da_flight_tkt_allow_detailsSearchObj.runPaged().count;
				log.debug("customrecord_da_flight_tkt_allow_detailsSearchObj result count",searchResultCount);
				customrecord_da_flight_tkt_allow_detailsSearchObj.run().each(function(result){
					record.delete({
						type:'customrecord_da_flight_tkt_allow_details',
						id:result.id
					})
					return true;
				});
				return search.create({
					type: "employee",
					filters:
						[
							["custentity_da_employee_grade","noneof","@NONE@"]
							],
							columns:
								[
									search.createColumn({name: "internalid", label: "Internal ID"})
									]
				});
			}
		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	/**
	 * Executes when the map entry point is triggered and applies to each key/value pair.
	 *
	 * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
	 * @since 2015.1
	 */
	function map(context) {
		try {
			//log.debug('map context', context.key);
			context.write({
				key: context.key,
				value: context.key
			});
		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	/**
	 * Executes when the reduce entry point is triggered and applies to each group.
	 *
	 * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
	 * @since 2015.1
	 */
	function reduce(context) {
		try {
			var empRecId = JSON.parse(context.key);
			log.debug('recId', empRecId);

			var empRecord =  record.load({
				type:'employee',
				id: empRecId
			});

			var homeCountry = empRecord.getValue('custentity_da_emp_home_country');

			var stayingCountry = empRecord.getValue('custentity_emp_working_country');

			var customrecord_define_iata_ratesSearchObj = search.create({
				type: "customrecord_define_iata_rates",
				filters:
					[
						["custrecord_employee_country","anyof",homeCountry]
						],
						columns:
							[
								search.createColumn({name: "custrecord_child_ticket_rate", label: "Child Ticket Rate (2-11 Years)"}),
								search.createColumn({name: "custrecord_adult_ticket_rate", label: "Adult Ticket Rate (&gt; 11 Years)"}),
								search.createColumn({name: "custrecord_infant_ticket_rate", label: "Infant Ticket Rate(0 -2 Years)"})
								]
			});
			var searchResultCount = customrecord_define_iata_ratesSearchObj.runPaged().count;
			log.debug("customrecord_define_iata_ratesSearchObj result count",searchResultCount);

			if(searchResultCount > 0){
				var adultTicketRate = 0, childTicketRate = 0 , InfantTicketRate = 0;
				customrecord_define_iata_ratesSearchObj.run().each(function(result){
					adultTicketRate = result.getValue('custrecord_adult_ticket_rate');
					childTicketRate = result.getValue('custrecord_child_ticket_rate');
					InfantTicketRate = result.getValue('custrecord_infant_ticket_rate');
					return true;
				});

				var gradeId = empRecord.getValue('custentity_da_employee_grade');

				log.debug('gradeId',gradeId);

				var gradeRec = record.load({
					type:'customrecord_da_pay_grades',
					id:gradeId
				});				

				var selfAmount = 0, spouseAmount = 0, childrenAmount = 0;

				var self = gradeRec.getValue('custrecord_da_ticket_allowanc_self');
				if(self){
					selfAmount = adultTicketRate;
				}
				var spouse = gradeRec.getValue('custrecord_da_flight_ticket_spouse');
				if(spouse){
					var customrecord_da_emp_family_membersSearchObj = search.create({
						type: "customrecord_da_emp_family_members",
						filters:
							[
								["custrecord_da_family_employee","anyof",empRecId], 
								"AND", 
								["custrecord_family_relation","anyof","1"], 
								"AND", 
								["custrecord_staying_country","anyof",stayingCountry]
								]
					});
					var searchResultCount = customrecord_da_emp_family_membersSearchObj.runPaged().count;
					log.debug("customrecord_da_emp_family_membersSearchObj result count",searchResultCount);
					if(searchResultCount > 0){
						spouseAmount = adultTicketRate;
					}
				}

				var noOfChildren = gradeRec.getValue('custrecord_da_flight_ticket_children');

				if(noOfChildren > 0){
					var customrecord_da_emp_family_membersSearchObj = search.create({
						type: "customrecord_da_emp_family_members",
						filters:
							[
                                ["custrecord_include_in_ticket","is","T"],
                                "AND",
								["custrecord_da_family_employee","anyof",empRecId], 
								"AND", 
								["custrecord_family_relation","anyof","2","3","4"], 
								"AND", 
								["custrecord_da_family_member_age","lessthan","18"], 
								"AND", 
								["custrecord_staying_country","anyof",stayingCountry]
								],
								columns:['custrecord_da_family_member_age']
					}).run().getRange(0,(noOfChildren-1));

					//var searchResultCount = customrecord_da_emp_family_membersSearchObj.runPaged().count;
					log.debug("customrecord_da_emp_family_membersSearchObj result count",customrecord_da_emp_family_membersSearchObj.length);

					var objLength = customrecord_da_emp_family_membersSearchObj.length;

					for(var i =0 ; i< objLength ;i++){
						var age = customrecord_da_emp_family_membersSearchObj[i].getValue('custrecord_da_family_member_age');

						log.debug('age',age);

						if(age < 2){
							childrenAmount = parseFloat(childrenAmount)+parseFloat(InfantTicketRate);
						}

						if(age >= 2 && age <= 11){
							childrenAmount = parseFloat(childrenAmount)+parseFloat(childTicketRate);
						}

						if(age > 11){
							childrenAmount = parseFloat(childrenAmount)+parseFloat(adultTicketRate);
						}

					}	

					log.debug('childrenAmount',childrenAmount);


				}

				var totalTicketAllowanceAmount = parseFloat(childrenAmount) + parseFloat(spouseAmount) + parseFloat(selfAmount);

				log.debug("totalTicketAllowanceAmount",totalTicketAllowanceAmount);

				var rec = record.create({
					type:'customrecord_da_flight_tkt_allow_details'
				});
				rec.setValue('custrecord_da_flight_tkt_employee',empRecId);
				rec.setValue('custrecord_da_flight_tkt_parent',1);
				rec.setValue('custrecord_flight_ticket_allow_amount',totalTicketAllowanceAmount);
				rec.save();

			}

		} catch (ex) {
			log.error(ex.name, ex.message);

		}
	}



	function daysInMonth (month, year) {
		return new Date(year, month, 0).getDate();
	}

	/**
	 * Executes when the summarize entry point is triggered and applies to the result set.
	 *
	 * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
	 * @since 2015.1
	 */
	function summarize(summary) {
		try {
			
			record.load({
				type:'customrecord_da_flight_ticket_allowances',
				id:1
			}).setValue('custrecord_da_flight_allow_recalculate',false).save();

		} catch (ex) {
			log.error(ex.name, ex.message);
		}

	}

	return {
		getInputData: getInputData,
		map: map,
		reduce: reduce,
		summarize: summarize
	};

});