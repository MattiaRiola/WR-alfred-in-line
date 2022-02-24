"use strict";
import alfy from 'alfy';
import wr from 'wordreference-api';

const EXAMPLE_SEPARATOR = { title: ".........................................................................................." };


var { from, to, fromText } = readInput();

if (false) {
	alfy.output([{ title: "wrong languages: " + from + '-' + to }])
} else {
	wr(fromText, from, to).then((wrResult) => {
		var results = []
		if (wrResult.translations.length == 0)
			results.push({ title: 'translation not found' });
		else
			translate(results,wrResult);

		alfy.output(results);
	});
}

function readInput() {
	var data = alfy.input;
	var from = data.substring(0, 2);
	var to = data.substring(2, 4);
	let fromText = data.substring(5);
	return { from, to, fromText };
}

/**
 * 
 * @param {*} results the results of the translation will be pushed in the results vector 
 * @param {*} wrResult word reference response from api
 */
function translate(results,wrResult){
	for (let index1 = 0; index1 < wrResult.translations.length; index1++) {
		const outerTranslation = wrResult.translations[index1];
		results.push({
			title: '~~~~~~~~~~~' + outerTranslation.title + '~~~~~~~~~~~'
		})
		for (let index2 = 0; index2 < outerTranslation.translations.length; index2++) {
			const innerTranslation = outerTranslation.translations[index2];
			if (innerTranslation.example.from.length > 0) {
				pushTranslationWithExample(results, innerTranslation);
			}
			else
				pushTranslationWithoutExample(results,innerTranslation);	
		}
	}
}


function pushTranslationWithExample(results, innerTranslation) {
	results.push(
		{
			title: innerTranslation.from + ' → ' + innerTranslation.to,
			subtitle: 'examples:'
		}
	);
	for (let i = 0; i < innerTranslation.example.from.length; i++) {
		const exFrom = innerTranslation.example.from[i];
		const exTo = innerTranslation.example.to[i];
		results.push(
			{
				title: exFrom,
				subtitle: exTo
			}
		);

	}
	results.push(EXAMPLE_SEPARATOR);
}

function pushTranslationWithoutExample(results,innerTranslation){
	results.push({
		title: innerTranslation.from + ' → ' + innerTranslation.to,
		// subtitle: 'type: ' + innerTranslation.from + ' → ' + innerTranslation.to
	});
}