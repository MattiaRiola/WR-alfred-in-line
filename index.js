"use strict";
import alfy from 'alfy';
import wr from 'wordreference-api';


var data = alfy.input;
wr(data, 'en', 'it').then((wrResult) => {
	var results = []
	for (let index1 = 0; index1 < wrResult.translations.length; index1++) {
		const outerTranslation = wrResult.translations[index1];
		for (let index2 = 0; index2 < outerTranslation.translations.length; index2++) {
			const innerTranslation = outerTranslation.translations[index2];
			results.push({
				title: innerTranslation.from,
				subtitle: innerTranslation.to
			});
		}
	}
	
	alfy.output(results);
});
