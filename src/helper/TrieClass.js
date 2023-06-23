import { DictionaryWord } from '../db/word-dictionary/en'
import { TechWord } from '../db/word-dictionary/techEn'
import { getTypeOfDeveloperInvolve } from './discussion';
import { extractTag } from './tagGeneratorAPI';
import { mergeObjectMap } from './util';

class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
    }
}


class ObjectTrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.data = {};
    }
}

class MapTrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;

        // listLevel_0 belongs to the list of developers who answered the query and falls under a specific tag.
        this.ListLevel_0 = new Map();

        // listLevel_0 belongs to the list of developers who contribute ( commented or replied ) the query and falls under a specific tag.
        this.ListLevel_1 = new Map();
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(key) {
        let node = this.root;
        for (let i = 0; i < key.length; i++) {
            const char = key[i];
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
        }
        node.isEndOfWord = true;
    }

    delete(key) {
        this.deleteHelper(this.root, key, 0);
    }

    deleteHelper(node, key, depth) {
        if (!node) {
            return null;
        }
        if (depth === key.length) {
            node.isEndOfWord = false;
            if (node.children.size === 0) {
                node = null;
            }
            return node;
        }
        const char = key[depth];
        node.children.set(
            char,
            this.deleteHelper(node.children.get(char), key, depth + 1)
        );
        if (node.children.size === 0 && !node.isEndOfWord) {
            node = null;
        }
        return node;
    }

    search(key) {
        let node = this.root;
        for (let i = 0; i < key.length; i++) {
            const char = key[i];
            if (!node.children.has(char)) {
                return false;
            }
            node = node.children.get(char);
        }
        if (node !== null && node.isEndOfWord)
            return node;
        else return false
    }

    wordMatchingPrefix(prefix) {
        let node = this.root;
        let result = [];
        for (let i = 0; i < prefix.length; i++) {
            const char = prefix[i];
            if (!node.children.has(char)) {
                return result;
            }
            node = node.children.get(char);
        }
        this.collectWords(node, prefix, result);
        return result;
    }

    collectWords(node, prefix, result) {
        if (!node) {
            return;
        }
        if (node.isEndOfWord) {
            result.push(prefix);
        }
        for (const [char, child] of node.children) {
            this.collectWords(child, prefix + char, result);
        }
    }

    // insert or update developer list which belong to a particular tag
    insertOrUpdateList(key, newListLevel_0, newListLevel_1) {
        let node = this.root;
        for (let i = 0; i < key.length; i++) {
            const char = key[i];
            if (!node.children.has(char)) {
                node.children.set(char, new MapTrieNode());
            }
            node = node.children.get(char);
        }

        // merge newListLevel_0 & 1 with old listLevel_0 & 1 correspondingly
        node.isEndOfWord = true;
        node.ListLevel_0 = mergeObjectMap(node.ListLevel_0, newListLevel_0);
        node.ListLevel_1 = mergeObjectMap(node.ListLevel_1, newListLevel_1);
    }

    // insert object data 
    insertObjectData(key, data) {
        let node = this.root;
        for (let i = 0; i < key.length; i++) {
            const char = key[i];
            if (!node.children.has(char)) {
                node.children.set(char, new ObjectTrieNode());
            }
            node = node.children.get(char);
        }

        node.isEndOfWord = true;
        node.data = data;
    }
}

export const DictionaryOfEnglishWords = new Trie();
export const DictionaryOfTechWordsLevel_0 = new Trie();
export const DictionaryOfTechWordsLevel_1 = new Trie();
//building discussion data dictionary 
export const DictionaryOfDiscussionData = new Trie();
export const DictionaryOfTagsWithDeveloperList = {
    // for title 
    titleDic: new Trie(),

    // for body
    bodyDic: new Trie()
}



export const createWordDictionary = () => {
    DictionaryWord.words.forEach((word) => {
        DictionaryOfEnglishWords.insert(word.toLowerCase());
    })

    TechWord.level_0.forEach((word) => {
        DictionaryOfTechWordsLevel_0.insert(word.toLowerCase());
    })

    TechWord.level_1.forEach((word) => {
        DictionaryOfTechWordsLevel_1.insert(word.toLowerCase());
    })
    return {
        DictionaryOfEnglishWords,
        DictionaryOfTechWordsLevel_0,
        DictionaryOfTechWordsLevel_1
    };
}

/**
 * @param {Array<object>}  discussionData object 
 * @returns {Array<object} modified discussion data which has tags in each discussion object 
 * 
 * This function extract the tags for every discussion object and create a Dictionary of tags with developer list globally
 * by using function DictionaryOfTagsWithDeveloperList.insertOrUpdateList().
 * 
 */
export const createDictionaryOfTagsWithDeveloperListAndAddTags = (discussionData) => {
    if (!discussionData) return [];
    const discussionDataWithTag = discussionData?.map((data) => {
        // tags from title`
        const tagsAndUrl = extractTag(data.title, data.bodyText);

        // Creating DictionaryOfTagsWithDeveloperList by inserting tag with related developerList
        tagsAndUrl.titleTags.forEach((key) => {
            const { level_0, level_1 } = getTypeOfDeveloperInvolve(data);
            DictionaryOfTagsWithDeveloperList.titleDic.insertOrUpdateList(key.toLowerCase(), level_0, level_1);
        })

        tagsAndUrl.bodyTags.forEach((key) => {
            const { level_0, level_1 } = getTypeOfDeveloperInvolve(data);
            DictionaryOfTagsWithDeveloperList.bodyDic.insertOrUpdateList(key.toLowerCase(), level_0, level_1);
        })

        //building discussion data dictionary
        DictionaryOfDiscussionData.insertObjectData(data.DiscussionUrl.toLowerCase(), data);

        return { ...data, tagsAndUrl }
    })
    return discussionDataWithTag;
}