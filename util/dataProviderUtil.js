'use strict';


var localizedTextData = require('localizedtestdata');
var existingLocales = localizedTextData.Locales;
var Util = localizedTextData.Util;


const readFile = require('./fileHandler.js').readFileSynchronously;


/*
 * The getTestDataByCountry method reads all the tests at a given dataprovider file, filters the tests that needs to be executed by the locale provided in the parameters
 * and returns the final set of tests that need to be executed.
 * @param  {array} locales  requested locales
 * @param {json} testDescription    test description with data and defaul
 *
 *
 *  getTestsData("test_amount_property_file",'bizwalletnodeweb/transferMoney.json',['US','FR'])
 */
const filterLocales = (locales, testDescription) => {
    Object.keys(testDescription.locales).forEach(
        function (locale) {
            let requestedLocales = '';
            locales.forEach(function (filteredLocale) {
                if (locale.includes(filteredLocale)) {
                    requestedLocales = requestedLocales + (',' + filteredLocale);
                }
            });

            requestedLocales = requestedLocales.substring(1);
            if (requestedLocales.length > 0) {
                if (!testDescription.locales.hasOwnProperty(requestedLocales)) {
                    testDescription.locales[requestedLocales] = testDescription.locales[locale];
                }
            }
            if (requestedLocales !== locale) {
                delete testDescription.locales[locale];
            }
        }
    );
};

const setupUser = (user, localeData, locale) => {

    let localeUserData = new Object;
    Object.assign(localeUserData, localeData)

    let country = localeUserData.hasOwnProperty('locale') ?
        (existingLocales.hasOwnProperty(localeUserData.locale) ? existingLocales[localeUserData.locale].country : console.log('\n\n Locale ' + locale + ' was not found \n\n')) :
        (existingLocales.hasOwnProperty(locale) ? existingLocales[locale].country : console.log('\n\n Locale ' + locale + ' was not found \n\n'));

    let defaultUser = {};
    defaultUser.country = country;
    Object.assign(defaultUser, user);
    let bank = {};
    let creditcard = {};
    let funds = Util.getFund(country);
    defaultUser.currency = localeUserData.currency || funds.currency;

    // setting up the banks
    if (localeUserData.hasOwnProperty('bankaccounts')) {
        if (localeUserData.bankaccounts.length <= 0) {
            localeUserData.bankaccounts.push({});
        }


        bank = Util.getBank(country);
        localeUserData.bankaccounts = localeUserData.bankaccounts.reduce(function (bankaccounts, bankData) {
            if (Object.keys(bankData).length <= 0) {
                if (bank) {
                    bankaccounts.push(bank);
                }
            } else {
                bankaccounts.push(bankData);
            }

            return bankaccounts;
        }, []);

        defaultUser.bankaccounts = localeUserData.bankaccounts;
    } else {
        defaultUser.bankaccounts = [];
    }


    // setting up the funds
    if (localeUserData.hasOwnProperty('funds')) {
        if (localeUserData.funds.length <= 0) {
            localeUserData.funds.push({});
        }

        localeUserData.funds = localeUserData.funds.reduce(function (fundDatas, fundData) {
            if (Object.keys(fundData).length <= 0) {
                if (funds) {
                    fundDatas.push(funds);
                }
            } else {
                fundDatas.push(fundData);
            }

            return fundDatas;
        }, []);

        defaultUser.funds = localeUserData.funds;
    } else {
        defaultUser.funds = [];
    }


    // setting up the creditcards
    if (localeUserData.hasOwnProperty('creditcards')) {
        if (localeUserData.creditcards.length <= 0) {
            localeUserData.creditcards.push({});
        }
        creditcard = Util.getCreditCard(country);
        localeUserData.creditcards = localeUserData.creditcards.reduce(function (cardDatas, cardData) {
            if (Object.keys(cardData).length <= 0) {
                if (creditcard) {
                    cardDatas.push(creditcard);
                }
            } else {
                cardDatas.push(cardData);
            }

            return cardDatas;
        }, []);

        defaultUser.creditcards = localeUserData.creditcards;
    } else {
        defaultUser.creditcards = [];
    }


    defaultUser.locale = localeUserData.locale || locale;
    defaultUser.type = localeUserData.type || defaultUser.type;
    defaultUser.firstName = localeUserData.firstName || Util.getFirstName(country);
    defaultUser.lastName = localeUserData.lastName || Util.getLastName(country);
    defaultUser.preferredLanguage = localeUserData.preferredLanguage || existingLocales[defaultUser.locale].language;
    if (defaultUser.type.toLowerCase() === Util.BUSINESS.toLowerCase()) {
        defaultUser.businessType = localeUserData.businessType || Util.getBusinessType(country);
        defaultUser.businessName = localeUserData.businessName || Util.getFirmName(country);
        defaultUser.bizUrl = localeUserData.bizUrl || Util.getBusinessUrl(country);

        defaultUser.bizAddressOne = localeUserData.bizAddressOne || Util.getBusinessAddress(country, 'street1');
        defaultUser.bizCity = localeUserData.bizCity || Util.getBusinessAddress(country, 'city');
        defaultUser.bizCountry = localeUserData.bizCountry || defaultUser.bizCountry;
        defaultUser.bizMonEstablished = localeUserData.bizMonEstablished || defaultUser.bizMonEstablished;
        defaultUser.bizState = localeUserData.bizState || Util.getBusinessAddress(country, 'state');
        defaultUser.bizCustomerServEmail = localeUserData.bizCustomerServEmail || defaultUser.bizCustomerServEmail;
        defaultUser.bizCSPhone = localeUserData.bizCSPhone || defaultUser.bizCSPhone;
        defaultUser.bizYearEstablished = localeUserData.bizYearEstablished || defaultUser.bizYearEstablished;
        defaultUser.bizZip = localeUserData.bizZip || Util.getBusinessAddress(country, 'zip');
        defaultUser.industry = localeUserData.industry || defaultUser.industry;
    }


    defaultUser.mcc = localeUserData.mcc || defaultUser.mcc;
    defaultUser.citizenship = localeUserData.citizenship || defaultUser.citizenship;
    defaultUser.confirmEmail = localeUserData.confirmEmail || defaultUser.confirmEmail;
    defaultUser.unConfirmedPhone = localeUserData.unConfirmedPhone || defaultUser.unConfirmedPhone;
    defaultUser.emailAddress = localeUserData.emailAddress || defaultUser.emailAddress;
    defaultUser.homeAddress1 = localeUserData.homeAddress1 || Util.getPersonalAddress(country, 'street1');
    defaultUser.homeAddress2 = localeUserData.homeAddress2 || Util.getPersonalAddress(country, 'street2');
    defaultUser.homeCity = localeUserData.homeCity || Util.getPersonalAddress(country, 'city');
    defaultUser.homeCountry = localeUserData.homeCountry || defaultUser.homeCountry;
    defaultUser.homePhoneNumber = localeUserData.homePhoneNumber || defaultUser.homePhoneNumber;
    defaultUser.homeState = localeUserData.homeState || Util.getPersonalAddress(country, 'state');
    defaultUser.homeZip = localeUserData.homeZip || Util.getPersonalAddress(country, 'zip');
    defaultUser.mobilePhone = localeUserData.mobilePhone || defaultUser.mobilePhone;
    defaultUser.securityAnswer1 = localeUserData.securityAnswer1 || defaultUser.securityAnswer1;
    defaultUser.securityAnswer2 = localeUserData.securityAnswer2 || defaultUser.securityAnswer2;
    defaultUser.securityQuestion1 = localeUserData.securityQuestion1 || defaultUser.securityQuestion1;
    defaultUser.securityQuestion2 = localeUserData.securityQuestion2 || defaultUser.securityQuestion2;
    defaultUser.emailPrefix = localeUserData.emailPrefix || defaultUser.emailPrefix;
    defaultUser.dateOfBirth = localeUserData.dateOfBirth || defaultUser.dateOfBirth;


    return defaultUser;
};


/**
 * The test data provider utility
 */

const getLocalizedTestData = (testData, urls) => {
    let allLocales = testData.locales || {};
    let testsArray = {};
    if (Object.keys(allLocales).length <= 0) {
        allLocales.en_US = {};
    }
    for (let multilocales in allLocales) {
        // noinspection Annotator
        let tests = JSON.parse(JSON.stringify(testData.default));
        let localeData = allLocales[multilocales];

        if (!localeData.hasOwnProperty('sender')) {
            localeData.sender = {};
        }
        if (!localeData.hasOwnProperty('receiver')) {
            localeData.receiver = {};
        }

        tests.locale = localeData.locale || tests.locale;
        tests.baseUrl = tests.baseUrl || urls.baseUrl;
        tests.productUrl = tests.productUrl || urls.productUrl;

        // setup default sender and receiver
        tests.sender = {};
        tests.receiver = {};
        tests.sender.currency = tests.receiver.currency = 'USD';
        tests.sender.type = tests.receiver.type = 'PERSONAL';
        tests.sender.firstName = tests.receiver.firstName = '';
        tests.sender.lastName = tests.receiver.lastName = '';
        tests.sender.businessType = tests.receiver.businessType = '';
        tests.sender.businessName = tests.receiver.businessName = '';
        tests.sender.bizUrl = tests.receiver.bizUrl = '';
        tests.sender.funds = tests.receiver.funds = [];
        tests.sender.creditcards = tests.receiver.creditcards = [];
        tests.sender.bankaccounts = tests.receiver.bankaccounts = [];
        tests.sender.preferredLanguage = tests.receiver.preferredLanguage = 'en_US';


        tests.sender.bizAddressOne = tests.receiver.bizAddressOne = '';
        tests.sender.bizCity = tests.receiver.bizCity = '';
        tests.sender.bizCountry = tests.receiver.bizCountry = '';
        tests.sender.bizMonEstablished = tests.receiver.bizMonEstablished = 0;
        tests.sender.bizState = tests.receiver.bizState = '';
        tests.sender.bizCustomerServEmail = tests.receiver.bizCustomerServEmail = '';
        tests.sender.bizCSPhone = tests.receiver.bizCSPhone = '';
        tests.sender.bizYearEstablished = tests.receiver.bizYearEstablished = 0;
        tests.sender.bizZip = tests.receiver.bizZip = '';
        tests.sender.industry = tests.receiver.industry = 0;
        tests.sender.mcc = tests.receiver.mcc = 0;
        tests.sender.citizenship = tests.receiver.citizenship = '';
        tests.sender.confirmEmail = tests.receiver.confirmEmail = false;
        tests.sender.unConfirmedPhone = tests.receiver.unConfirmedPhone = false;
        tests.sender.emailAddress = tests.receiver.emailAddress = '';
        tests.sender.homeAddress1 = tests.receiver.homeAddress1 = '';
        tests.sender.homeAddress2 = tests.receiver.homeAddress2 = '';
        tests.sender.homeCity = tests.receiver.homeCity = '';
        tests.sender.homeCountry = tests.receiver.homeCountry = '';
        tests.sender.homePhoneNumber = tests.receiver.homePhoneNumber = '';
        tests.sender.homeState = tests.receiver.homeState = '';
        tests.sender.homeZip = tests.receiver.homeZip = '';
        tests.sender.mobilePhone = tests.receiver.mobilePhone = '';
        tests.sender.securityAnswer1 = tests.receiver.securityAnswer1 = '';
        tests.sender.securityAnswer2 = tests.receiver.securityAnswer2 = '';
        tests.sender.securityQuestion1 = tests.receiver.securityQuestion1 = 0;
        tests.sender.securityQuestion2 = tests.receiver.securityQuestion2 = 0;
        tests.sender.emailPrefix = tests.receiver.emailPrefix = '';
        tests.sender.dateOfBirth = tests.receiver.dateOfBirth = '';


        let locales = [];
        locales = multilocales.split(',');
        let tempTests = {};
        locales.forEach(function (locale) {
            Object.assign(tempTests, tests);
            tempTests.sender = setupUser(tests.sender, localeData.sender, locale);
            tempTests.receiver = setupUser(tests.receiver, localeData.receiver, locale);

            if (localeData.hasOwnProperty('creditcards')) {
                tempTests.creditcards = localeData.creditcards;
            }

            if (localeData.hasOwnProperty('bankaccounts')) {
                tempTests.bankaccounts = localeData.bankaccounts;
            }

            testsArray[localeData.locale || locale] = {};
            Object.assign(testsArray[localeData.locale || locale], tempTests);
        });
    }


    return testsArray; // /tests array for  each locale for that description
};


/*
 * The getTestData method reads all the tests at a given dataprovider file, filters the tests that needs to be executed and returns the final set of tests that need to be executed.
 * @param  {string} testCaseName  the testcasename for the data to be provided
 * @param {string}               the test data provider file for that given test
 * @return {json}               the test data for that given test case
 *
 *  getTestsData("test_amount_property_file",'bizwalletnodeweb/transferMoney.json')
 */
const getTestsData = (testCaseName, dataProviderFile, urls, singleLocale) => {
    let testData = {};
    try {
        testData = JSON.parse(
            readFile(dataProviderFile));
    } catch (error) {
        console.log(error);
        console.error('\n Error in file ' + dataProviderFile + '\n');
    }

    let testName = dataProviderFile.replace(/^.*[\\\/]/, '').replace('.json', '');
    let testDescription = testData[testCaseName] || {};
    if (Object.keys(testDescription).length <= 0) {
        console.log('No test case data found with the name: \'' + testCaseName + '\' in file: \'' + dataProviderFile + '\'');
        return;
    }
    if (singleLocale) {
        Object.keys(testDescription.locales).forEach(
            function (locale) {
                let newKeyName = ';';
                if (locale.includes(',')) {
                    newKeyName = locale.substring(0, locale.indexOf(','));
                } else {
                    newKeyName = locale;
                }

                if (!testDescription.locales.hasOwnProperty(newKeyName)) {
                    testDescription.locales[newKeyName] = testDescription.locales[locale];
                    delete testDescription.locales[locale];
                }
            }
        );
    }


    testDescription.testName = testName;
    return getLocalizedTestData(testDescription, urls);
};

/*
 * The getTestDataByCountry method reads all the tests at a given dataprovider file, filters the tests that needs to be executed by the locale provided in the parameters
 * and returns the final set of tests that need to be executed.
 * @param  {string} testCaseName  the testcasename for the data to be provided
 * @param {string}               the test data provider file for that given test
 * @return {json}               the test data for that given test case
 *
 *
 *  getTestsData("test_amount_property_file",'bizwalletnodeweb/transferMoney.json',['US','FR'])
 */
const getTestsDataByCountry = (testCaseName, dataProviderFile, locales, urls) => {
    let testData = {};
    try {
        testData = JSON.parse(
            readFile(dataProviderFile));
    } catch (error) {
        console.log(error);
        console.error('\n Error in file ' + dataProviderFile + '\n');
    }

    let testName = dataProviderFile.replace(/^.*[\\\/]/, '').replace('.json', '');
    let testDescription = testData[testCaseName] || {};
    if (Object.keys(testDescription).length <= 0) {
        console.log('No test case data found with the name: \'' + testCaseName + '\' in file: \'' + dataProviderFile + '\'');
        return;
    }
    testDescription.testName = testName;

    // remove locales not requested
    filterLocales(locales, testDescription);

    // add locales requested but are not in data provider
    locales.forEach(function (locale) {
        let addAsNewLocale = true;
        if (!testDescription.locales.hasOwnProperty(locale)) {
            Object.keys(testDescription.locales).every(function (testDescLocale, index) {
                if (testDescLocale.includes(locale)) {
                    addAsNewLocale = false;
                }

                return addAsNewLocale;
            });

            if (addAsNewLocale) {
                testDescription.locales[locale] = {};
                testDescription.locales[locale].sender = {};
                testDescription.locales[locale].receiver = {};
            }
        }
    });


    return getLocalizedTestData(testDescription, urls);
};

module.exports = {
    getTestsData: getTestsData,
    getTestsDataByCountry: getTestsDataByCountry
};

// getTestData("../spec/dataprovider/bizwalletnodeweb/transferMoney.json");
