"use strict";
import alfy from 'alfy';
import wr from 'wordreference-api';
import configstore from 'configstore';
let languagePair = new configstore('language-config-pair');

let errMsgTitle = '';
let errMsgSubtitle = '';
const EXAMPLE_SEPARATOR = "..........................................................................................";
const langs = {
	'ar': 'Arabic',
	'ca': 'Catalan',
	'zh': 'Chinese',
	'cs': 'Czech',
	'nl': 'Dutch',
	'en': 'English',
	'fr': 'French',
	'de': 'German',
	'gr': 'Greek',
	'is': 'Icelandic',
	'it': 'Italian',
	'ja': 'Japanese',
	'ko': 'Korean',
	'pl': 'Polish',
	'pt': 'Portuguese',
	'ro': 'Romanian',
	'ru': 'Russian',
	'es': 'Spanish',
	'sv': 'Swedish',
	'tr': 'Turkish',
};

let output = []
let reverse = false;
let specifiedLanguage = false;
let DEBUG = false;
let inputDebug = 'acqua';


var { from, to, fromText } = readInput();
if (from && to) {
	let wrResult = await wr(fromText, from, to);


	if (wrResult.translations.length != 0) {
		if (specifiedLanguage && reverse) {
			// output.push({
			// 	title: "requested translation not found but found translation from " + to + " to " + from,
			// 	icon: alfy.icon.alert
			// })
		}
		mapTranslation(output, wrResult, reverse);
	}

	let tmp = to;
	to = from;
	from = tmp;
	reverse = true;
	let wrResultReverse = await wr(fromText, from, to);

	if (wrResultReverse.translations.length != 0) {
		if (specifiedLanguage && reverse) {
			output.push({
				title: "requested translation not found but found translation from " + to + " to " + from,
				icon: alfy.icon.alert
			})
		}
		mapTranslation(output, wrResultReverse);
	}
	if (wrResult.translations.length == 0 && wrResultReverse.translations.length == 0)
		output.push({ title: 'translation not found' });




	alfy.output(output);

}

/**
 * from and to are set from the alfred input if the input is like 'en-it', 
 * if the first word of the input doesn't contain 'it-en' 
 * from and to are taken from the configuration made by trc workflow https://github.com/xfslove/alfred-language-configuration
 * Errors are pushed in the output variable (and from and to are returned undefined)
 * @returns from language, to language, fromText the text to be translated. 
 */
function readInput() {
	let data = alfy.input;
	if (DEBUG)
		data = inputDebug;
	if (data[2] == '-') {
		specifiedLanguage = true;
		from = data.substring(0, 2);
		to = data.substring(3, 5);
		fromText = data.substring(5);
	} else {
		errMsgTitle += "languages are not specified in input (ex: en-it). "
		let pairConfig = languagePair.get('pair');
		if (pairConfig) {
			let pair0 = pairConfig[0];
			let pair1 = pairConfig[1];
			if (langs[pair0] && langs[pair1]) {
				from = pair0;
				to = pair1;
			} else {
				errMsgTitle += "the configured languages (" + pair0 + '-' + pair1 + ") are not supported. "
				errMsgSubtitle += 'use trc workflow extension to configure the languages. '
				output.push(
					{
						title: errMsgTitle,
						subtitle: errMsgSubtitle,
						quicklookurl: `https://github.com/xfslove/alfred-language-configuration`,
						icon: {
							path: alfy.icon.error
						}
					}
				)
				return { undefined, undefined, data };
			}

		} else { //add no configuration error and wrong input error
			errMsgTitle += "configuration not found. "
			errMsgSubtitle += 'use trc workflow extension to configure the languages. '
			output.push(
				{
					title: errMsgTitle,
					subtitle: errMsgSubtitle,
					quicklookurl: `https://github.com/xfslove/alfred-language-configuration`,
					icon: {
						path: alfy.icon.error
					}
				}
			)
			return { undefined, undefined, data };
		}

		fromText = data; //all the input should be translated as is
	}
	return { from, to, fromText };
}

/**
 * 
 * @param {*} results the results of the translation will be pushed in the results vector 
 * @param {*} wrResult word reference response from api
 */
function mapTranslation(results, wrResult) {
	results.push({
		title: '~~~~~~~~~~~ '  + from + " → " + to + ' ~~~~~~~~~~~',
		quicklookurl: `https://www.wordreference.com/${from}${to}/${fromText}`,
		icon: {
			path: './icon_translation/' + from + to + '.png'
		}
	})
	for (let index1 = 0; index1 < wrResult.translations.length; index1++) {
		const outerTranslation = wrResult.translations[index1];
		
		for (let index2 = 0; index2 < outerTranslation.translations.length; index2++) {
			const innerTranslation = outerTranslation.translations[index2];
			if (innerTranslation.example.from.length > 0) {
				pushTranslationWithExample(results, innerTranslation);
			}
			else
				pushTranslationWithoutExample(results, innerTranslation);
		}
	}
}


function pushTranslationWithExample(results, innerTranslation) {
	// results.push({
	// 	title: `from: ${langs[from]} to: ${langs[to]}`,
	// 	subtitle: EXAMPLE_SEPARATOR,
	// 	icon: {
	// 		path: './icon_translation/' + from + to + '.png'
	// 	}

	// });
	
	results.push(
		{
			title: innerTranslation.from + ' → ' + innerTranslation.to,
			subtitle: 'examples:',
			icon: {
				path: './icon_translation/' + from + to + '.png'
			}
		}
	);
	for (let i = 0; i < innerTranslation.example.from.length; i++) {
		const exFrom = innerTranslation.example.from[i];
		const exTo = innerTranslation.example.to[i];
		results.push(
			{
				title: exFrom,
				subtitle: exTo,
				icon: {
					path: './icon_translation/' +'example'+ '.png'
				}
			}
		);

	}
	
}

function pushTranslationWithoutExample(results, innerTranslation) {
	results.push({
		title: innerTranslation.from + ' → ' + innerTranslation.to,
		icon: {
			path: './icon_translation/' + from + to + '.png'
		}
		// subtitle: 'type: ' + innerTranslation.from + ' → ' + innerTranslation.to
	});
}