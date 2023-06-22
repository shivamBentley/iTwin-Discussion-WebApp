// const Typo = require('typo-js');
// const DictionaryOfEnglishWords = new Typo('en_US');

import { DictionaryOfEnglishWords, DictionaryOfTechWordsLevel_0, DictionaryOfTechWordsLevel_1 } from "./TrieClass";

function removeEscapedCharacters(text) {
    // Remove \n
    var withoutNewLine = text.replace(/\n/g, " ");

    // removing multiSpaces from text 
    const res = withoutNewLine.replace(/\s+/g, ' ').trim()

    return res;
}

export const extractTag = (titleText, bodyText) => {
    const plainTitleText = removeEscapedCharacters(titleText).toLowerCase();
    const plainBodyText = removeEscapedCharacters(bodyText).toLowerCase();

    const titleWords = new Set(plainTitleText.match(/(https:)?(www\.)?(\^?\d?[A-Z-.@/a-z'\d]{1,})\w+/g));
    const bodyWords = new Set(plainBodyText.match(/(https:)?(www\.)?(\^?\d?[A-Z-.@/a-z'\d]{1,})\w+/g));

    const titleTags = [];
    const bodyTags = [];

    // refining title tag 
    titleWords?.forEach((word) => {
        if (
            (!DictionaryOfEnglishWords.search(word.toLowerCase())) ||
            (DictionaryOfTechWordsLevel_0.search(word.toLowerCase())) ||
            (DictionaryOfTechWordsLevel_1.search(word.toLowerCase()))) {
            titleTags.push(word);
        }
    });

    // refining body tag 
    bodyWords?.forEach((word) => {
        if (
            (!DictionaryOfEnglishWords.search(word.toLowerCase())) ||
            (DictionaryOfTechWordsLevel_0.search(word.toLowerCase())) ||
            (DictionaryOfTechWordsLevel_1.search(word.toLowerCase()))) {
            bodyTags.push(word);
        }
    });

    return { titleTags, bodyTags };
}
