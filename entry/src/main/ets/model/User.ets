/**
 * 用户信息模型
 */
export interface UserInfo {
  oId: string;
  userName: string;
  userNickname: string;
  userAvatarURL: string;
  userIntro: string;
  userURL: string;
  point: number;           // 积分
  liveness: number;        // 活跃度
  followingCount: number;  // 关注数
  followerCount: number;   // 粉丝数
  articleCount: number;    // 文章数
  onlineMinute: number;    // 在线时长（分钟）
  cardBg: string;          // 卡片背景
}

/**
 * 登录响应
 */
export interface LoginResponse {
  code: number;
  Key: string;
  msg: string;
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  code: number;
  data: UserInfo[];
}

/**
 * 用户信息响应
 */
export interface UserInfoResponse {
  code: number;
  data: UserInfo;
}

/**
 * 关注操作响应
 */
export interface FollowResponse {
  code: number;
  msg: string;
}

/**
 * 积分转账请求
 */
export interface TransferRequest {
  toUser: string;
  amount: number;
  memo?: string;
}
