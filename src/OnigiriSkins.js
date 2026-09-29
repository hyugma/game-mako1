/**
 * OnigiriSkins - キャラクタースキン管理モジュール
 * 
 * スキンを追加するには:
 * 1. public/assets/skins/ に画像を配置
 * 2. SKINS 配列に新しいエントリを追加
 * 3. スキンIDで setSkin() を呼ぶだけ
 */

// 利用可能なスキン定義
// imagePath は public/ フォルダからの相対パス (Vite が base を自動付与)
const BASE = import.meta.env?.BASE_URL || '/game-mako1/';

export const SKINS = [
  {
    id: 'white',
    name: 'しろおむすび',
    description: 'シンプルな白いおにぎり',
    imagePath: `${BASE}assets/skins/onigiri_white.png`,
  },
  {
    id: 'sesame',
    name: 'ごまおにぎり',
    description: '白ごまと黒ごまがたっぷり',
    imagePath: `${BASE}assets/skins/onigiri_sesame.png`,
  },
  {
    id: 'nori',
    name: 'のりおにぎり',
    description: '海苔でしっかり巻いたおにぎり',
    imagePath: `${BASE}assets/skins/onigiri_nori.png`,
  },
];

// デフォルトスキンID
export const DEFAULT_SKIN = 'white';

/**
 * スキンマネージャー: 画像のプリロードと管理を担当
 */
export class SkinManager {
  constructor() {
    this.images = {};      // id -> Image object
    this.loaded = {};      // id -> boolean
    this.currentSkinId = DEFAULT_SKIN;
    this._loadPromises = {};
  }

  /**
   * すべてのスキン画像をプリロード
   * @returns {Promise} すべての画像がロードされたら解決
   */
  preloadAll() {
    const promises = SKINS.map(skin => this._loadImage(skin));
    return Promise.all(promises);
  }

  /**
   * 特定のスキンの画像をロード
   * @param {Object} skin - スキン定義オブジェクト
   * @returns {Promise<Image>}
   */
  _loadImage(skin) {
    if (this._loadPromises[skin.id]) {
      return this._loadPromises[skin.id];
    }

    this._loadPromises[skin.id] = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[skin.id] = img;
        this.loaded[skin.id] = true;
        resolve(img);
      };
      img.onerror = (e) => {
        console.warn(`Failed to load skin: ${skin.id} from ${skin.imagePath}`, e);
        this.loaded[skin.id] = false;
        reject(e);
      };
      img.src = skin.imagePath;
    });

    return this._loadPromises[skin.id];
  }

  /**
   * 現在のスキンを変更
   * @param {string} skinId - スキンID ('white', 'sesame', 'nori')
   */
  setSkin(skinId) {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) {
      console.warn(`Unknown skin: ${skinId}`);
      return;
    }
    this.currentSkinId = skinId;
  }

  /**
   * 現在選択中のスキン画像を取得
   * @returns {Image|null}
   */
  getCurrentImage() {
    return this.images[this.currentSkinId] || null;
  }

  /**
   * 現在のスキン情報を取得
   * @returns {Object}
   */
  getCurrentSkin() {
    return SKINS.find(s => s.id === this.currentSkinId);
  }

  /**
   * すべてのスキンリストを取得
   * @returns {Array}
   */
  getAllSkins() {
    return SKINS;
  }

  /**
   * スキンが読み込み済みかチェック
   * @param {string} skinId
   * @returns {boolean}
   */
  isLoaded(skinId) {
    return !!this.loaded[skinId];
  }
}

// シングルトンインスタンス
export const skinManager = new SkinManager();
