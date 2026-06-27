import preferences from "@ohos:data.preferences";
import hilog from "@ohos:hilog";
/**
 * 本地存储工具类
 * 使用Preferences进行轻量级数据存储
 */
export class StorageUtil {
    private static preferencesInstance: preferences.Preferences | null = null;
    /**
     * 检查是否已初始化
     */
    static isInitialized(): boolean {
        return StorageUtil.preferencesInstance !== null;
    }
    /**
     * 初始化Preferences实例
     */
    static async init(context: Context): Promise<void> {
        try {
            StorageUtil.preferencesInstance = await preferences.getPreferences(context, 'fishpi_config');
            hilog.info(0x0000, 'StorageUtil', 'Preferences initialized successfully');
        }
        catch (err) {
            hilog.error(0x0000, 'StorageUtil', `Init failed: ${err}`);
        }
    }
    /**
     * 存储字符串
     */
    static async set(key: string, value: string): Promise<void> {
        hilog.info(0x0000, 'StorageUtil', `set(${key}, ${value.substring(0, 10)}...)`);
        if (!StorageUtil.preferencesInstance) {
            hilog.error(0x0000, 'StorageUtil', 'set: preferencesInstance is null!');
            return;
        }
        try {
            await StorageUtil.preferencesInstance.put(key, value);
            await StorageUtil.preferencesInstance.flush();
            hilog.info(0x0000, 'StorageUtil', `set(${key}) success`);
        }
        catch (err) {
            hilog.error(0x0000, 'StorageUtil', `set failed: ${err}`);
        }
    }
    /**
     * 获取字符串
     */
    static async get(key: string, defaultValue: string = ''): Promise<string> {
        hilog.info(0x0000, 'StorageUtil', `get(${key}), instance: ${StorageUtil.preferencesInstance ? 'ok' : 'null'}`);
        if (!StorageUtil.preferencesInstance)
            return defaultValue;
        try {
            const value = await StorageUtil.preferencesInstance.get(key, defaultValue);
            hilog.info(0x0000, 'StorageUtil', `get(${key}) = ${value ? (value as string).substring(0, 10) + '...' : 'empty'}`);
            return value as string;
        }
        catch (err) {
            hilog.error(0x0000, 'StorageUtil', `get failed: ${err}`);
            return defaultValue;
        }
    }
    /**
     * 存储布尔值
     */
    static async setBool(key: string, value: boolean): Promise<void> {
        await StorageUtil.set(key, value ? 'true' : 'false');
    }
    /**
     * 获取布尔值
     */
    static async getBool(key: string, defaultValue: boolean = false): Promise<boolean> {
        const value = await StorageUtil.get(key, defaultValue ? 'true' : 'false');
        return value === 'true';
    }
    /**
     * 存储数字
     */
    static async setNumber(key: string, value: number): Promise<void> {
        await StorageUtil.set(key, value.toString());
    }
    /**
     * 获取数字
     */
    static async getNumber(key: string, defaultValue: number = 0): Promise<number> {
        const value = await StorageUtil.get(key, defaultValue.toString());
        return Number(value) || defaultValue;
    }
    /**
     * 存储JSON对象
     */
    static async setJSON(key: string, value: object): Promise<void> {
        await StorageUtil.set(key, JSON.stringify(value));
    }
    /**
     * 获取JSON对象
     */
    static async getJSON<T>(key: string, defaultValue: T): Promise<T> {
        const value = await StorageUtil.get(key, '');
        if (!value)
            return defaultValue;
        try {
            return JSON.parse(value) as T;
        }
        catch {
            return defaultValue;
        }
    }
    /**
     * 删除指定key
     */
    static async delete(key: string): Promise<void> {
        if (!StorageUtil.preferencesInstance)
            return;
        try {
            await StorageUtil.preferencesInstance.delete(key);
            await StorageUtil.preferencesInstance.flush();
        }
        catch (err) {
            // 删除失败
        }
    }
    /**
     * 清空所有数据
     */
    static async clear(): Promise<void> {
        if (!StorageUtil.preferencesInstance)
            return;
        try {
            await StorageUtil.preferencesInstance.clear();
            await StorageUtil.preferencesInstance.flush();
        }
        catch (err) {
            // 清空失败
        }
    }
    // 存储Key常量
    static readonly KEY_API_KEY = 'api_key';
    static readonly KEY_USER_NAME = 'user_name';
    static readonly KEY_USER_AVATAR = 'user_avatar';
    static readonly KEY_USER_INFO = 'user_info';
    static readonly KEY_DARK_MODE = 'dark_mode';
    static readonly KEY_NOTIFICATION_ENABLED = 'notification_enabled';
}
