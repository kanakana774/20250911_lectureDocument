# Spring コンテナ・DI・スコープ・AOP まとめ

## 🧩 1. Spring コンテナとは

- **Spring コンテナ**（`ApplicationContext`）は
  アプリ起動時に全ての`@Component`や`@Service`などの Bean を生成・管理する仕組み。
- Bean の依存関係（`@Autowired`や`@Inject`）を自動的に解決してくれる。
  → **依存性注入（DI: Dependency Injection）**

### コンテナ管理の目的

- インスタンス生成や依存解決を**一元管理**することで、

  - new の乱立防止
  - テストや再利用のしやすさ向上
  - ライフサイクル管理（初期化・破棄）を自動化
    が可能になる。

---

## 🧱 2. Bean スコープとは

Spring では生成される Bean の**ライフサイクル（スコープ）**を指定できる。

| スコープ名                | 説明                                                      |
| ------------------------- | --------------------------------------------------------- |
| `singleton`（デフォルト） | コンテナ内で 1 インスタンスのみ。すべての注入箇所で共有。 |
| `prototype`               | `getBean()`されるたびに**新しいインスタンスを生成**。     |
| `request`                 | HTTP リクエストごとに新しいインスタンス（Web アプリ用）。 |
| `session`                 | HTTP セッションごとに 1 インスタンス。                    |

---

## 🧩 3. prototype スコープとは

- **毎回新しいインスタンスを生成したい場合に使う。**

- 例：

  ```java

  @Component
  @Scope("prototype")
  public class MyPrototypeBean {
      @Autowired
      private HelperService helper;  // ← Springが注入する

      public void doSomething() {
          helper.execute();
      }
  }

  @Service
  public class TaskService {

      @Autowired
      private ApplicationContext context;

      public void runTask() {
          MyPrototypeBean bean = context.getBean(MyPrototypeBean.class); // ← Springが生成
          bean.doSomething();
      }
  }
  ```

- ➡ この場合：

  - Spring が新しいインスタンスを作る。
  - その際、依存関係（@Autowired や@Value）が正しく注入される。
  - AOP の仕掛け（@Transactional, @Async など）も有効。

---

- 呼び出すたびに別インスタンスが返る：

  ```java
  @Component
  @Scope("prototype")
  public class TaskContext {}
  ```

  ```java
  TaskContext t1 = context.getBean(TaskContext.class);
  TaskContext t2 = context.getBean(TaskContext.class);
  assertNotSame(t1, t2); // ✅ 違うインスタンス
  ```

### 普通の`new`との違い

| 比較点             | prototype bean                    | new                              |
| ------------------ | --------------------------------- | -------------------------------- |
| 生成場所           | Spring コンテナ                   | 呼び出し元コード                 |
| DI の適用          | ✅ あり（依存が自動注入される）   | ❌ 自分で依存を new する必要あり |
| ライフサイクル管理 | Spring が初期化・破棄フックを実行 | 自分で管理                       |
| AOP 対象           | ✅ AOP が適用される               | ❌ 適用されない                  |

つまり、`@Scope("prototype")` は「**new するけど DI も AOP も効く**」のが最大のメリット。

---

## 🧠 4. Spring AOP とは

AOP（Aspect Oriented Programming：**アスペクト指向プログラミング**）は、
業務ロジックとは関係ない共通処理（例：トランザクション、ログ、セキュリティチェックなど）を
**メソッド呼び出しの前後に差し込む**仕組み。

### 目的

- 重複コードの排除（DRY）
- 共通処理の一元化
- 業務ロジックの関心事と分離（Separation of Concerns）

---

## 🪞 5. AOP の実装構造（プロキシ）

Spring は AOP を実現するために、対象クラスを**「プロキシ（代理）」**でラップする。

```
呼び出し元
   ↓
[Proxyクラス] ← ここでbefore/after処理を実行
   ↓
[本物のBeanインスタンス]
```

- 実体のクラス（`@Component`など）は**確かにインスタンス化されている**。
- ただし、呼び出しは一度**プロキシを経由**して渡される。
- このため、AOP はメソッド呼び出しを横取りして
  `@Around`, `@Before`, `@After` のような共通処理を挿入できる。

---

## ⚙️ 6. プロキシの実態

- 実際には、Spring は以下のどちらかを使って動的にプロキシクラスを生成する：

  - **JDK 動的プロキシ**（インターフェースがある場合）
  - **CGLIB プロキシ**（クラスを継承して作る場合）

例：

```java
@Service
public class OrderService {
    public void order() {...}
}
```

Spring 起動時に内部的にこんな構造が作られる：

```
OrderService$$EnhancerBySpringCGLIB$$xxxx
   └── extends OrderService
   └── override order() {
           // AOP before()
           super.order();
           // AOP after()
       }
```

🔸CGLIB の場合のイメージ
Spring は起動時に、あなたのクラスを継承した動的サブクラスを作ります。

```java
public class MyService$$EnhancerBySpringCGLIB extends MyService {

    @Override
    public void run() {
        // before advice（トランザクション開始など）
        super.run(); // ここで自分が書いたメソッドが呼ばれる
        // after advice（コミットなど）
    }

}
```

- つまり：
  - 本体クラス (MyService) のコンストラクタは確かに呼ばれます。
  - でも実際に DI コンテナに登録されているのは、この「拡張された偽物（代理）クラス」。

---

## 💡 7. AOP と prototype/new の違いまとめ

| 比較項目         | Spring AOP      | prototype bean          | new              |
| ---------------- | --------------- | ----------------------- | ---------------- |
| インスタンス生成 | Spring コンテナ | Spring コンテナ         | 自分で           |
| 呼び出し経路     | プロキシを経由  | 直接（ただし AOP 可能） | 直接（AOP 不可） |
| 依存解決         | 自動 DI         | 自動 DI                 | 手動             |
| AOP 適用         | ✅              | ✅                      | ❌               |

---

## 🧭 8. まとめ

- **Spring コンテナ**：アプリ全体の依存関係とライフサイクルを管理。
- **Bean スコープ**：`singleton`が基本。`prototype`は「毎回 new するけど DI は効く」。
- **AOP**：共通処理を「呼び出しの前後に差し込む」仕組み。
- **プロキシ**：Spring が生成する「代理クラス」。実際の Bean をラップして AOP などを実現。
