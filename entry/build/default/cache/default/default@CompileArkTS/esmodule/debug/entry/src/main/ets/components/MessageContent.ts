if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MessageContent_Params {
    content?: string;
    md?: string;
    maxImageWidth?: number;
}
export class MessageContent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__content = new SynchedPropertySimpleOneWayPU(params.content, this, "content");
        this.__md = new SynchedPropertySimpleOneWayPU(params.md, this, "md");
        this.__maxImageWidth = new SynchedPropertySimpleOneWayPU(params.maxImageWidth, this, "maxImageWidth");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MessageContent_Params) {
        if (params.content === undefined) {
            this.__content.set('');
        }
        if (params.md === undefined) {
            this.__md.set('');
        }
        if (params.maxImageWidth === undefined) {
            this.__maxImageWidth.set(150);
        }
    }
    updateStateVars(params: MessageContent_Params) {
        this.__content.reset(params.content);
        this.__md.reset(params.md);
        this.__maxImageWidth.reset(params.maxImageWidth);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__content.purgeDependencyOnElmtId(rmElmtId);
        this.__md.purgeDependencyOnElmtId(rmElmtId);
        this.__maxImageWidth.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__content.aboutToBeDeleted();
        this.__md.aboutToBeDeleted();
        this.__maxImageWidth.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __content: SynchedPropertySimpleOneWayPU<string>; // HTML内容
    get content() {
        return this.__content.get();
    }
    set content(newValue: string) {
        this.__content.set(newValue);
    }
    private __md: SynchedPropertySimpleOneWayPU<string>; // Markdown内容
    get md() {
        return this.__md.get();
    }
    set md(newValue: string) {
        this.__md.set(newValue);
    }
    private __maxImageWidth: SynchedPropertySimpleOneWayPU<number>;
    get maxImageWidth() {
        return this.__maxImageWidth.get();
    }
    set maxImageWidth(newValue: number) {
        this.__maxImageWidth.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.md) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.RenderContent.bind(this)(this.parseMarkdown(this.md));
                });
            }
            else if (this.content) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.RenderContent.bind(this)(this.parseHtml(this.content));
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    RenderContent(parts: ContentPart[], parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const part = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    if (part.type === 'image') {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Image.create(part.content);
                                Image.width(this.maxImageWidth);
                                Image.objectFit(ImageFit.Contain);
                                Image.borderRadius(8);
                                Image.margin({ top: 4, bottom: 4 });
                            }, Image);
                        });
                    }
                    else if (part.type === 'link') {
                        this.ifElseBranchUpdateFunction(1, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(part.text);
                                Text.fontSize(14);
                                Text.fontColor('#007AFF');
                                Text.decoration({ type: TextDecorationType.Underline });
                            }, Text);
                            Text.pop();
                        });
                    }
                    else if (part.type === 'code') {
                        this.ifElseBranchUpdateFunction(2, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(part.text);
                                Text.fontSize(13);
                                Text.fontColor('#d63384');
                                Text.backgroundColor('#f5f5f5');
                                Text.padding({ left: 4, right: 4, top: 2, bottom: 2 });
                                Text.borderRadius(4);
                            }, Text);
                            Text.pop();
                        });
                    }
                    else {
                        this.ifElseBranchUpdateFunction(3, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(part.text);
                                Text.fontSize(14);
                                Text.fontColor('#333333');
                                Text.maxLines(20);
                                Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                            }, Text);
                            Text.pop();
                        });
                    }
                }, If);
                If.pop();
            };
            this.forEachUpdateFunction(elmtId, parts, forEachItemGenFunction, (part: ContentPart, index: number) => `${index}_${part.type}_${part.text || part.content}`, true, true);
        }, ForEach);
        ForEach.pop();
    }
    // 解析Markdown
    parseMarkdown(md: string): ContentPart[] {
        const parts: ContentPart[] = [];
        let text = md;
        // 先提取图片 ![alt](url)
        const imgRegex = /!\[.*?\]\((.*?)\)/g;
        let imgMatch: RegExpExecArray | null = null;
        let lastIdx = 0;
        while ((imgMatch = imgRegex.exec(md)) !== null) {
            if (imgMatch.index > lastIdx) {
                parts.push(...this.parseInlineText(md.substring(lastIdx, imgMatch.index)));
            }
            parts.push({ type: 'image', content: imgMatch[1], text: '' });
            lastIdx = imgMatch.index + imgMatch[0].length;
        }
        if (lastIdx < md.length) {
            parts.push(...this.parseInlineText(md.substring(lastIdx)));
        }
        return parts.length > 0 ? parts : [{ type: 'text', text: md, content: '' }];
    }
    // 解析行内文本（链接、代码、加粗等）
    parseInlineText(text: string): ContentPart[] {
        const parts: ContentPart[] = [];
        let remaining = text;
        // 简单处理：按换行分割
        const lines = remaining.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
                // 换行作为空格处理
            }
            const line = lines[i].trim();
            if (line) {
                // 检测链接 [text](url)
                const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    parts.push({ type: 'link', text: linkMatch[1], content: linkMatch[2] });
                }
                else {
                    parts.push({ type: 'text', text: line, content: '' });
                }
            }
        }
        return parts;
    }
    // 解析HTML
    parseHtml(html: string): ContentPart[] {
        const parts: ContentPart[] = [];
        let text = html;
        // 提取图片 <img src="url">
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let imgMatch: RegExpExecArray | null = null;
        let lastIdx = 0;
        while ((imgMatch = imgRegex.exec(html)) !== null) {
            if (imgMatch.index > lastIdx) {
                const txt = this.stripHtmlTags(html.substring(lastIdx, imgMatch.index));
                if (txt.trim()) {
                    parts.push({ type: 'text', text: txt.trim(), content: '' });
                }
            }
            parts.push({ type: 'image', content: imgMatch[1], text: '' });
            lastIdx = imgMatch.index + imgMatch[0].length;
        }
        if (lastIdx < html.length) {
            const txt = this.stripHtmlTags(html.substring(lastIdx));
            if (txt.trim()) {
                parts.push({ type: 'text', text: txt.trim(), content: '' });
            }
        }
        return parts.length > 0 ? parts : [{ type: 'text', text: this.stripHtmlTags(html), content: '' }];
    }
    // 移除HTML标签
    stripHtmlTags(html: string): string {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    }
    rerender() {
        this.updateDirtyElements();
    }
}
interface ContentPart {
    type: 'text' | 'image' | 'link' | 'code';
    text: string;
    content: string;
}
