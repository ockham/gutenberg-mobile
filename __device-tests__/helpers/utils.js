/**
 * @flow
 * @format
 * */

/**
 * External dependencies
 */
import childProcess from 'child_process';
import wd from 'wd';
import fs from 'fs';
/**
 * Internal dependencies
 */
import serverConfigs from './serverConfigs';
import { ios12, android8 } from './caps';
import _ from 'underscore';

const spawn = childProcess.spawn;

// Platform setup
const defaultPlatform = 'android';
const rnPlatform = process.env.TEST_RN_PLATFORM || defaultPlatform;

// Environment setup, local environment or Sauce Labs
const defaultEnvironment = 'local';
const testEnvironment = process.env.TEST_ENV || defaultEnvironment;

// Local App Paths
const defaultAndroidAppPath = './android/app/build/outputs/apk/debug/app-debug.apk';
const defaultIOSAppPath = './ios/build/gutenberg/Build/Products/Debug-iphonesimulator/gutenberg.app';

const localAndroidAppPath = process.env.ANDROID_APP_PATH || defaultAndroidAppPath;
const localIOSAppPath = process.env.IOS_APP_PATH || defaultIOSAppPath;

const localAppiumPort = serverConfigs.local.port; // Port to spawn appium process for local runs

// $FlowFixMe
const timer = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const isAndroid = () => {
	return rnPlatform.toLowerCase() === 'android';
};

const isLocalEnvironment = () => {
	return testEnvironment.toLowerCase() === 'local';
};

// Initialises the driver and desired capabilities for appium
const setupDriver = async () => {
	const serverConfig = isLocalEnvironment() ? serverConfigs.local : serverConfigs.sauce;
	const driver = wd.promiseChainRemote( serverConfig );

	let desiredCaps;
	if ( isAndroid() ) {
		desiredCaps = _.clone( android8 );
		if ( isLocalEnvironment() ) {
			desiredCaps.app = localAndroidAppPath;
		} else {
			desiredCaps.app = 'sauce-storage:Gutenberg.apk'; // App should be preloaded to sauce storage, this can also be a URL
		}
	} else {
		desiredCaps = _.clone( ios12 );
		if ( isLocalEnvironment() ) {
			desiredCaps.app = localIOSAppPath;
		} else {
			const branch = process.env.CIRCLE_BRANCH;
			desiredCaps.app = `sauce-storage:Gutenberg.app.zip`; // App should be preloaded to sauce storage, this can also be a URL
		}
	}

	if ( ! isLocalEnvironment() ) {
		const branch = process.env.CIRCLE_BRANCH;
		desiredCaps.name = `Gutenberg Editor Tests[${ rnPlatform }]-${ branch }`;
		desiredCaps.tags = [ 'Gutenberg', branch ];
	}

	await driver.init( desiredCaps );

	const status = await driver.status();
	// Display the driver status
	// eslint-disable-next-line no-console
	console.log( status );

	await driver.setImplicitWaitTimeout( 2000 );
	await timer( 3000 );
	return driver;
};

// Spawns an appium process in the background
const setupAppium = async () => {
	const out = fs.openSync( './appium-out.log', 'a' );
	const err = fs.openSync( './appium-out.log', 'a' );

	const appium = await spawn( 'appium', [ '-p', '' + localAppiumPort ], {
		detached: true, stdio: [ 'ignore', out, err ],

	} );

	// Wait a little for server to fire up
	await timer( 5000 );
	return appium;
};

// attempts to type a string to a given element, need for this stems from
// https://github.com/appium/appium/issues/12285#issuecomment-471872239
// https://github.com/facebook/WebDriverAgent/issues/1084
const typeString = async ( element: wd.PromiseChainWebdriver.Element, str: string, clear: boolean = false ) => {
	if ( clear ) {
		await element.clear();
	}

	return await element.type( str );
};

const clickMiddleOfElement = async ( driver: wd.PromiseChainWebdriver, element: wd.PromiseChainWebdriver.Element ) => {
	const location = await element.getLocation();
	const size = await element.getSize();

	const action = await new wd.TouchAction( driver );
	action.press( { x: location.x + ( size.width / 2 ), y: location.y } );
	action.release();
	await action.perform();
};

const clickBeginningOfElement = async ( driver: wd.PromiseChainWebdriver, element: wd.PromiseChainWebdriver.Element ) => {
	const location = await element.getLocation();
	const action = await new wd.TouchAction( driver );
	action.press( { x: location.x, y: location.y } );
	action.release();
	await action.perform();
};

module.exports = {
	timer,
	setupAppium,
	setupDriver,
	isLocalEnvironment,
	isAndroid,
	typeString,
	clickMiddleOfElement,
	clickBeginningOfElement,
};