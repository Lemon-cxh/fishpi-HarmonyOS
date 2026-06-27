if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BreezemoonPage_Params {
    breezemoons?: Breezemoon[];
    isLoading?: boolean;
    showPublishDialog?: boolean;
    publishContent?: string;
    isPublishing?: boolean;
    topRectHeight?: number;
}
import { HttpUtil } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import type { ApiResponse } from "@bundle:com.example.fishpi/entry/ets/util/HttpUtil";
import { TimeUtil } from "@bundle:com.example.fishpi/entry/ets/util/TimeUtil";
import type { Breezemoon, BreezemoonListResponse } from '../model/Notification';
class BreezemoonPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__breezemoons = new ObservedPropertyObjectPU([], this, "breezemoons");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__showPublishDialog = new ObservedPropertySimplePU(false, this, "showPublishDialog");
        this.__publishContent = new ObservedPropertySimplePU('', this, "publishContent");
        this.__isPublishing = new ObservedPropertySimplePU(false, this, "isPublishing");
        this.__topRectHeight = this.createStorageProp('topRectHeight', 0, "topRectHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BreezemoonPage_Params) {
        if (params.breezemoons !== undefined) {
            this.breezemoons = params.breezemoons;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.showPublishDialog !== undefined) {
            this.showPublishDialog = params.showPublishDialog;
        }
        if (params.publishContent !== undefined) {
            this.publishContent = params.publishContent;
        }
        if (params.isPublishing !== undefined) {
            this.isPublishing = params.isPublishing;
        }
    }
    updateStateVars(params: BreezemoonPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__breezemoons.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__showPublishDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__publishContent.purgeDependencyOnElmtId(rmElmtId);
        this.__isPublishing.purgeDependencyOnElmtId(rmElmtId);
        this.__topRectHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__breezemoons.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__showPublishDialog.aboutToBeDeleted();
        this.__publishContent.aboutToBeDeleted();
        this.__isPublishing.aboutToBeDeleted();
        this.__topRectHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __breezemoons: ObservedPropertyObjectPU<Breezemoon[]>;
    get breezemoons() {
        return this.__breezemoons.get();
    }
    set breezemoons(newValue: Breezemoon[]) {
        this.__breezemoons.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __showPublishDialog: ObservedPropertySimplePU<boolean>;
    get showPublishDialog() {
        return this.__showPublishDialog.get();
    }
    set showPublishDialog(newValue: boolean) {
        this.__showPublishDialog.set(newValue);
    }
    private __publishContent: ObservedPropertySimplePU<string>;
    get publishContent() {
        return this.__publishContent.get();
    }
    set publishContent(newValue: string) {
        this.__publishContent.set(newValue);
    }
    private __isPublishing: ObservedPropertySimplePU<boolean>;
    get isPublishing() {
        return this.__isPublishing.get();
    }
    set isPublishing(newValue: boolean) {
        this.__isPublishing.set(newValue);
    }
    // 状态栏高度（用于避让）
    private __topRectHeight: ObservedPropertyAbstractPU<number>;
    get topRectHeight() {
        return this.__topRectHeight.get();
    }
    set topRectHeight(newValue: number) {
        this.__topRectHeight.set(newValue);
    }
    /**
     * 页面出现时加载数据
     */
    async aboutToAppear(): Promise<void> {
        await this.loadBreezemoons();
    }
    /**
     * 加载清风明月列表
     */
    private async loadBreezemoons(): Promise<void> {
        if (this.isLoading)
            return;
        this.isLoading = true;
        try {
            const response = await HttpUtil.get<BreezemoonListResponse>('/api/breezemoons');
            if (response.code === 0 && response.data) {
                this.breezemoons = response.data;
            }
        }
        catch (err) {
            // 加载清风明月失败
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * 发布清风明月
     */
    private async publish(): Promise<void> {
        const content = this.publishContent.trim();
        if (!content || this.isPublishing)
            return;
        this.isPublishing = true;
        try {
            const params = new Map<string, string>();
            params.set('breezemoonContent', content);
            const response = await HttpUtil.post<ApiResponse>('/breezemoon', params);
            if (response.code === 0) {
                this.publishContent = '';
                this.showPublishDialog = false;
                // 重新加载列表
                await this.loadBreezemoons();
            }
        }
        catch (err) {
            // 发布清风明月失败
        }
        finally {
            this.isPublishing = false;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.padding({ top: this.getUIContext().px2vp(this.topRectHeight) });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部导航栏
            Row.create();
            // 顶部导航栏
            Row.width('100%');
            // 顶部导航栏
            Row.height(56);
            // 顶部导航栏
            Row.padding({ left: 16, right: 16 });
            // 顶部导航栏
            Row.backgroundColor('#FFFFFF');
            // 顶部导航栏
            Row.border({ width: { bottom: 0.5 }, color: '#E8E8E8' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('返回');
            Text.fontSize(16);
            Text.fontColor('#1890FF');
            Text.onClick(() => {
                try {
                    this.getUIContext().getRouter().back();
                }
                catch (err) {
                    // 路由返回失败
                }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('清风明月');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.margin({ left: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('发布');
            Text.fontSize(14);
            Text.fontColor('#1890FF');
            Text.onClick(() => {
                this.showPublishDialog = true;
            });
        }, Text);
        Text.pop();
        // 顶部导航栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 列表内容
            if (this.isLoading && this.breezemoons.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.width(40);
                        LoadingProgress.height(40);
                    }, LoadingProgress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('加载中...');
                        Text.fontSize(14);
                        Text.fontColor('#999999');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else if (this.breezemoons.length === 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🌙');
                        Text.fontSize(48);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无清风明月');
                        Text.fontSize(16);
                        Text.fontColor('#999999');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('快去发布一条吧');
                        Text.fontSize(14);
                        Text.fontColor('#CCCCCC');
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.layoutWeight(1);
                        List.width('100%');
                        List.backgroundColor('#F5F5F5');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.BreezemoonItem.bind(this)(item);
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.breezemoons, forEachItemGenFunction, (item: Breezemoon) => item.oId, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 发布弹窗
            if (this.showPublishDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor('#00000066');
                        Column.justifyContent(FlexAlign.Center);
                        Column.position({ x: 0, y: 0 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('90%');
                        Column.padding(20);
                        Column.backgroundColor('#FFFFFF');
                        Column.borderRadius(12);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('发布清风明月');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#333333');
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: '写下你的想法...', text: this.publishContent });
                        TextInput.type(InputType.Normal);
                        TextInput.width('100%');
                        TextInput.height(120);
                        TextInput.backgroundColor('#F5F5F5');
                        TextInput.borderRadius(8);
                        TextInput.padding(12);
                        TextInput.onChange((value: string) => {
                            this.publishContent = value;
                        });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ top: 16 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.type(ButtonType.Capsule);
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor('#F5F5F5');
                        Button.fontColor('#666666');
                        Button.onClick(() => {
                            this.showPublishDialog = false;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(this.isPublishing ? '发布中...' : '发布');
                        Button.type(ButtonType.Capsule);
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor('#1890FF');
                        Button.fontColor('#FFFFFF');
                        Button.margin({ left: 12 });
                        Button.enabled(!this.isPublishing && this.publishContent.trim().length > 0);
                        Button.onClick(() => {
                            this.publish();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    /**
     * 清风明月项组件
     */
    BreezemoonItem(item: Breezemoon, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#FFFFFF');
            Column.margin({ bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 作者信息
            Row.create();
            // 作者信息
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(item.breezemoonAuthorAvatarURL || '');
            Image.width(36);
            Image.height(36);
            Image.borderRadius(18);
            Image.backgroundColor('#E8E8E8');
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(item.breezemoonAuthorName);
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(TimeUtil.formatTime(item.breezemoonCreateTime));
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Column.pop();
        // 作者信息
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 内容
            Text.create(item.breezemoonContent);
            // 内容
            Text.fontSize(15);
            // 内容
            Text.fontColor('#333333');
            // 内容
            Text.lineHeight(24);
            // 内容
            Text.margin({ top: 12 });
        }, Text);
        // 内容
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "BreezemoonPage";
    }
}
registerNamedRoute(() => new BreezemoonPage(undefined, {}), "", { bundleName: "com.example.fishpi", moduleName: "entry", pagePath: "pages/BreezemoonPage", pageFullPath: "entry/src/main/ets/pages/BreezemoonPage", integratedHsp: "false", moduleType: "followWithHap" });
