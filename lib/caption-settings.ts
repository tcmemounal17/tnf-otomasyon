export type CaptionSettings={textSource?:'description'|'title';sameText?:boolean};
export function applyCaption<T extends {title:string;description:string;originalTitle?:string;originalDescription?:string}>(article:T,settings:CaptionSettings):T{
 const originalTitle=article.originalTitle||article.title;
 const originalDescription=article.originalDescription??article.description;
 const title=(settings.textSource==='title'?originalTitle:originalDescription.trim()||originalTitle);
 return {...article,originalTitle,originalDescription,title,description:settings.sameText!==false?title:article.description};
}

/** Remove only the automatic trailing photo credit from previously prepared captions. */
export function withoutPhotoCredit(text:string):string{
 return text.replace(/(?:\n\n|\\n\\n)(?:Fotoğraf kaynağı:|Arşiv\/temsili fotoğraf(?: \(olayın görüntüsü değildir\))?:)[\s\S]*$/, '').trimEnd();
}
