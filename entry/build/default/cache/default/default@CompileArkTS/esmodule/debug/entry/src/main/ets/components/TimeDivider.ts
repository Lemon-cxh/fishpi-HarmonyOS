if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TimeDivider_Params {
    timeLabel?: string;
}
export class TimeDivider extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__timeLabel = new SynchedPropertySimpleOneWayPU(params.timeLabel, this, "timeLabel");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TimeDivider_Params) {
        if (params.timeLabel === undefined) {
            this.__timeLabel.set('');
        }
    }
    updateStateVars(params: TimeDivider_Params) {
        this.__timeLabel.reset(params.timeLabel);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__timeLabel.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__timeLabel.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __timeLabel: SynchedPropertySimpleOneWayPU<string>;
    get timeLabel() {
        return this.__timeLabel.get();
    }
    set timeLabel(newValue: string) {
        this.__timeLabel.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.Center);
            Row.margin({ top: 16, bottom: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.timeLabel);
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
