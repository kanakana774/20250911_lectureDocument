# 自分的な要約

> 使う側は変数に格納してインスタンスを使う。
> その変数のふるまい（＝契約）を型として定義する。
> 使う側はその型の中身のコードやコメント、フィールド名やメソッド名を見て明示的な内容も暗黙的な内容も理解し、使う。（＝実際にインスタンス化したクラスの中身を詳しく見なくてよい）
> なので、その型から連想できることを逸脱したサブクラスを作ってはいけない。
> どれが契約なのかは暗黙的なドメインルール（銀行の残高は 0 を下回らないなど）もあるので難しいが常識というような思い込みも契約による設計で整理して考えてみる。
>
> - 契約による設計
>   - **事前条件 (Precondition):** メソッドが実行される前に、呼び出し側（クライアント）が満たさなければならない条件。
>   - **事後条件 (Postcondition):** メソッドが正常に完了した後に、呼び出される側（サプライヤー）が保証しなければならない条件。
>   - **不変条件 (Invariant):** クラスのインスタンスが、メソッドの呼び出し前後を問わず、常に満たしていなければならない状態。

## リスコフの置換原則 (LSP) と「契約による設計」

### 1. リスコフの置換原則 (LSP) とは？

リスコフの置換原則 (LSP) は、SOLID 原則の「L」にあたるもので、以下の原則を提唱しています。

**「プログラム中のオブジェクトは、そのスーパークラス（またはインターフェース）のオブジェクトと置換可能でなければならない」**

これはつまり、派生クラス（子クラス）のオブジェクトを基底クラス（親クラス）の型として使用しても、プログラムの**正当性（期待される振る舞い）が損なわれてはならない**という意味です。

LSP は、オブジェクト指向における**継承関係を正しく使うための指針**であり、特に**ポリモーフィズム**を安全に利用するために不可欠です。

**なぜ LSP が重要なのか？**

- **信頼性:** 呼び出し側（クライアント）が基底クラスの型を扱っているとき、どんな派生クラスのインスタンスが渡されても、その挙動が予測可能で安定していることを保証します。
- **保守性・拡張性:** 新しい派生クラスを追加しても、既存の基底クラスに依存するコードを変更する必要がありません。
- **コードの理解しやすさ:** 継承関係が複雑になっても、各クラスの役割と振る舞いが一貫しているため、コードの理解が容易になります。

### 2. 「契約による設計 (Design by Contract: DbC)」

LSP を深く理解するためには、「契約による設計 (Design by Contract: DbC)」という考え方が役立ちます。これは、ソフトウェアのコンポーネントが互いにどのように振る舞うべきかについて、明確な「契約」を定義するアプローチです。

この契約は、主に以下の 3 つの要素で構成されます。

- **事前条件 (Precondition):** メソッドが実行される前に、呼び出し側（クライアント）が満たさなければならない条件。
- **事後条件 (Postcondition):** メソッドが正常に完了した後に、呼び出される側（サプライヤー）が保証しなければならない条件。
- **不変条件 (Invariant):** クラスのインスタンスが、メソッドの呼び出し前後を問わず、常に満たしていなければならない状態。

これらの契約は、メソッドのシグネチャ（引数や戻り値の型）だけでなく、**メソッドの動作の意味合い（セマンティクス）**や、**オブジェクトの状態に関する保証**を含みます。多くの場合、これらの契約は**Javadoc コメント**などのドキュメントで明示的に記述されるべきです。

### 3. LSP における契約のルールと具体例

LSP は、この「契約」が継承関係でどのように変化できるかを定めています。

#### 3.1. 事前条件 (Precondition)

- **定義:** メソッドが正しく動作するために、呼び出し側が満たさなければならない条件。
  「このメソッドを実行する前に、この状態であることを保証してください。」という約束です。

- **LSP のルール:** 派生クラスのメソッドの事前条件は、基底クラスのメソッドの事前条件と同じか、**より緩く**することができます。**厳しくすることはできません。**

- **なぜ厳しくしてはいけないのか？**
  呼び出し側は、基底クラスの型としてオブジェクトを扱っている場合、基底クラスの事前条件を満たすようにコードを書いています。もし派生クラスが基底クラスよりも厳しい事前条件を課した場合、呼び出し側は意図せずその新しい事前条件を満たせなくなり、プログラムが予期せぬエラーを起こす可能性があります。これは、呼び出し側の「期待」を裏切ることになります。

- **具体例: 数値の除算**

  **基底クラス `Calculator`**
  （ここでは、契約の一部を Javadoc で明示的に記述します）

  ```java
  class Calculator {
      /**
       * 2つの数値を除算します。
       *
       * @param num1 除数
       * @param num2 被除数
       *             **事前条件:** num2は0であってはなりません。
       *             もし0の場合、IllegalArgumentExceptionをスローします。
       * @return num1をnum2で割った結果。
       * @throws IllegalArgumentException num2が0の場合。
       */
      public double divide(double num1, double num2) {
          if (num2 == 0) { // 事前条件チェック
              throw new IllegalArgumentException("num2 cannot be zero.");
          }
          return num1 / num2;
      }
  }
  ```

  `Calculator` の `divide` メソッドの契約は、「`num2` が 0 でないこと」という事前条件を持っています。

  **LSP 違反となる悪い派生クラス `SuperSafeCalculator` (事前条件を厳しくする例)**

  ```java
  class SuperSafeCalculator extends Calculator {
      @Override
      public double divide(double num1, double num2) {
          // **LSP違反:** 基底クラスより厳しい事前条件を課している
          // 基底クラスは num2 が負の数でも許容するが、この派生クラスは許容しない
          if (num2 <= 0) { // 事前条件を「num2は0または負であってはならない」と厳しく変更
              throw new IllegalArgumentException("num2 cannot be zero or negative.");
          }
          return num1 / num2;
      }
  }
  ```

  **LSP 違反の呼び出し側コード:**

  ```java
  public class PreconditionViolationExample {
      public static void demonstrateDivision(Calculator calc) {
          // 呼び出し側はCalculatorの契約（num2が0でなければOK）を期待してコードを書く
          double result = calc.divide(10, -2); // -2 は0ではないので、Calculatorの契約上は問題ないはず
          System.out.println("Result: " + result);
      }

      public static void main(String[] args) {
          Calculator normalCalc = new Calculator();
          System.out.println("--- Using Calculator ---");
          demonstrateDivision(normalCalc); // 正常終了: Result: -5.0

          System.out.println("\n--- Using SuperSafeCalculator (LSP違反) ---");
          Calculator superSafeCalc = new SuperSafeCalculator();
          // 期待: -5.0
          // 実際: IllegalArgumentException: num2 cannot be zero or negative.
          demonstrateDivision(superSafeCalc); // 実行時エラー！
      }
  }
  ```

  `demonstrateDivision` メソッドは `Calculator` 型の引数を受け取るので、`num2` が 0 でなければどんな値でも処理してくれると「期待」しています。しかし、`SuperSafeCalculator` のインスタンスが渡されると、`num2` が負の数であることで例外がスローされ、期待される振る舞いが壊れます。これが事前条件における LSP 違反です。

#### 3.2. 事後条件 (Postcondition)

- **定義:** メソッドが正常に完了した後に、呼び出される側が保証しなければならない条件。
  「このメソッドが正常に終了したら、この状態になっていることを保証します。」という約束です。

- **LSP のルール:** 派生クラスのメソッドの事後条件は、基底クラスのメソッドの事後条件と同じか、**より厳しく**することができます。**緩くすることはできません。**

- **なぜ緩くしてはいけないのか？**
  呼び出し側は、基底クラスの事後条件を満たしていると仮定して、その戻り値やオブジェクトの状態に対する追加の処理を記述しています。もし派生クラスが基底クラスの事後条件より緩い（つまり保証が少ない）場合、呼び出し側は期待していた結果が得られず、プログラムが誤動作する可能性があります。より厳しくすることは、「期待以上の保証」なので問題ありません。

- **具体例: リストのフィルタリング**

  **基底クラス `ListProcessor`**

  ```java
  import java.util.ArrayList;
  import java.util.List;

  class ListProcessor {
      /**
       * 与えられたリストから偶数のみをフィルタリングします。
       *
       * @param numbers フィルタリング対象の数値リスト。
       * @return 偶数のみを含む新しいリスト。
       *         **事後条件:** 返されるリストには偶数のみが含まれ、元のリストの順序は変更されません。
       */
      public List<Integer> filterEvenNumbers(List<Integer> numbers) {
          List<Integer> evens = new ArrayList<>();
          for (int num : numbers) {
              if (num % 2 == 0) {
                  evens.add(num);
              }
          }
          return evens;
      }
  }
  ```

  `ListProcessor` の `filterEvenNumbers` メソッドは、「返されるリストには偶数のみが含まれる」という事後条件を持っています。

  **LSP 準拠となる良い派生クラス `SortedListProcessor` (事後条件を厳しくする例)**

  ```java
  import java.util.Collections;

  class SortedListProcessor extends ListProcessor {
      @Override
      public List<Integer> filterEvenNumbers(List<Integer> numbers) {
          List<Integer> evens = super.filterEvenNumbers(numbers); // まず基底クラスの事後条件（偶数のみ）を満たす
          Collections.sort(evens); // 追加の保証：リストをソートする（事後条件を厳しくする）
          return evens;
      }
  }
  ```

  `SortedListProcessor` は、基底クラスの「偶数のみを返す」という契約を守りつつ、さらに「ソートされている」という追加の保証（より厳しい事後条件）を提供しています。これは LSP に準拠しています。

  **LSP 違反となる悪い派生クラス `BrokenListProcessor` (事後条件を緩くする例)**

  ```java
  class BrokenListProcessor extends ListProcessor {
      @Override
      public List<Integer> filterEvenNumbers(List<Integer> numbers) {
          // **LSP違反:** 基底クラスの事後条件「偶数のみ」を破っている
          List<Integer> mixed = new ArrayList<>();
          for (int num : numbers) {
              mixed.add(num); // 偶数だけでなく奇数も追加してしまう
          }
          return mixed;
      }
  }
  ```

  **LSP 違反の呼び出し側コード:**

  ```java
  import java.util.Arrays;

  public class PostconditionViolationExample {
      public static void processAndUseEvens(ListProcessor processor, List<Integer> data) {
          List<Integer> evens = processor.filterEvenNumbers(data);
          // 呼び出し側は「evensには偶数のみが含まれている」と期待して、次の処理を書く
          System.out.println("Filtered Evens: " + evens);
          for (int num : evens) {
              if (num % 2 != 0) {
                  System.err.println("Error: Found odd number where only evens were expected! -> " + num); // 期待されない状態
              }
          }
      }

      public static void main(String[] args) {
          List<Integer> data = Arrays.asList(5, 2, 8, 1, 9, 4, 7);

          System.out.println("--- Using ListProcessor ---");
          ListProcessor normalProcessor = new ListProcessor();
          processAndUseEvens(normalProcessor, data); // 正常終了: Filtered Evens: [2, 8, 4]

          System.out.println("\n--- Using BrokenListProcessor (LSP違反) ---");
          ListProcessor brokenProcessor = new BrokenListProcessor();
          // 期待: 偶数のみのリスト
          // 実際: 奇数も混ざったリストが返され、エラーメッセージが表示される
          processAndUseEvens(brokenProcessor, data); // 実行時エラーが発生する可能性も
      }
  }
  ```

  `processAndUseEvens` メソッドは `ListProcessor` 型の引数を受け取るので、「返されるリストには偶数のみが含まれる」と「期待」して、その後の処理（例えば偶数であることを前提とした計算など）を行います。しかし、`BrokenListProcessor` が渡されると、奇数が混ざったリストが返され、期待される振る舞いが壊れます。

#### 3.3. 不変条件 (Invariant)

- **定義:** クラスのインスタンスが、いかなる時点（メソッドが呼び出される前、メソッドが終了した後）でも常に満たしていなければならない条件。
  「このオブジェクトは、いかなるメソッドが実行される前後でも、常にこの状態であることを保証します。」という約束です。

- **LSP のルール:** 派生クラスは、基底クラスの不変条件を**維持**しなければなりません。

- **なぜ維持しなければならないのか？**
  基底クラスの不変条件は、そのクラスを使用するクライアントが信頼する基本的な保証です。もし派生クラスがこの不変条件を壊すと、基底クラスのオブジェクトを期待していた箇所で派生クラスのオブジェクトを使用したときに、オブジェクトが不正な状態になり、プログラムが予期せぬエラーを起こす可能性があります。

- **具体例: 銀行口座**

  **基底クラス `BankAccount`**

  ```java
  class BankAccount {
      protected double balance; // 口座残高

      /**
       * 新しい銀行口座を作成します。
       *
       * @param initialBalance 初期残高
       *                       **事前条件:** initialBalanceは0以上であること。
       * @throws IllegalArgumentException 初期残高が負の場合。
       * **不変条件:** この口座の残高 (balance) は、いかなる操作の前後でも常に0.0以上である。
       */
      public BankAccount(double initialBalance) {
          if (initialBalance < 0) { // 事前条件チェック
              throw new IllegalArgumentException("Initial balance cannot be negative.");
          }
          this.balance = initialBalance;
      }

      /**
       * 口座に入金します。
       * @param amount 入金額
       *               **事前条件:** amountは0以上であること。
       * @postcondition 口座残高が入金額分増加している。不変条件 (balance >= 0) は維持される。
       */
      public void deposit(double amount) {
          if (amount < 0) {
              throw new IllegalArgumentException("Deposit amount cannot be negative.");
          }
          this.balance += amount;
          // 不変条件 (balance >= 0) が維持されることを確認 (このメソッドでは常に保証される)
      }

      /**
       * 口座から出金します。
       * @param amount 出金額
       *               **事前条件:** amountは0以上であり、かつ現在の残高を超過しないこと。
       * @throws IllegalArgumentException 出金額が負の場合、または残高不足の場合。
       * @postcondition 口座残高が出金額分減少している。不変条件 (balance >= 0) は維持される。
       */
      public void withdraw(double amount) {
          if (amount < 0) {
              throw new IllegalArgumentException("Withdraw amount cannot be negative.");
          }
          if (this.balance - amount < 0) { // 不変条件 (balance >= 0) が破られないためのチェック
              throw new IllegalArgumentException("Insufficient funds.");
          }
          this.balance -= amount;
      }

      public double getBalance() {
          return balance;
      }
  }
  ```

  `BankAccount` クラスの不変条件は、「`balance` は常に 0.0 以上である」ことです。コンストラクタや各メソッドは、この不変条件が破られないように設計されています。

  **LSP 違反となる悪い派生クラス `BuggyBankAccount` (不変条件を壊す例)**

  ```java
  class BuggyBankAccount extends BankAccount {
      public BuggyBankAccount(double initialBalance) {
          super(initialBalance);
      }

      @Override
      public void withdraw(double amount) {
          if (amount < 0) {
              throw new IllegalArgumentException("Withdraw amount cannot be negative.");
          }
          // **LSP違反:** 基底クラスの不変条件 (balance >= 0) を壊す可能性
          // 残高が負になることを許してしまうため、不変条件が破られる
          this.balance -= amount;
          // 不足金額チェックがない！
      }
  }
  ```

  **LSP 違反の呼び出し側コード:**

  ```java
  public class InvariantViolationExample {
      public static void displayBalance(BankAccount account) {
          // 呼び出し側は口座残高が常に0以上であると「期待」している
          System.out.println("Current balance: " + account.getBalance());
          if (account.getBalance() < 0) {
              System.err.println("WARNING: Account balance is negative! This should not happen."); // 期待されない状態
          }
      }

      public static void main(String[] args) {
          BankAccount normalAccount = new BankAccount(100);
          normalAccount.withdraw(50);
          System.out.println("--- Using BankAccount ---");
          displayBalance(normalAccount); // 正常: Current balance: 50.0

          System.out.println("\n--- Using BuggyBankAccount (LSP違反) ---");
          BankAccount buggyAccount = new BuggyBankAccount(100);
          // BuggyBankAccountのwithdrawは不変条件を破り、残高が負になる
          buggyAccount.withdraw(150);
          // 期待: 残高不足で例外、または残高が0
          // 実際: 残高が負になる
          displayBalance(buggyAccount); // 警告メッセージが表示される
      }
  }
  ```

  `displayBalance` メソッドは `BankAccount` 型の引数を受け取るので、残高が常に 0 以上であると「期待」しています。しかし、`BuggyBankAccount` のインスタンスが渡されると、`withdraw` メソッドによって残高が負になり、`BankAccount` が保証すべき不変条件が破られます。これは LSP 違反であり、呼び出し側のコードが期待する前提を崩すため、バグの原因となります。

### 4. まとめ: 「使う側の期待」を明文化し、遵守する

あなたの仰った**「使う側の気持ちを考える」**という言葉は、LSP の理解において非常に重要です。

インターフェースや基底クラスは、単なるコード上の宣言（メソッドのシグネチャなど）だけでなく、その型が持つ**「振る舞いに関する約束事の全体」**、つまり「契約」を表しています。

呼び出し側は、この契約に基づいてコードを書きます。

- 「このメソッドに特定の条件で引数を渡せば（**事前条件**）、こういった結果が返ってくるだろう（**事後条件**）。」
- 「このオブジェクトは常に特定の状態を保っているだろう（**不変条件**）。」

派生クラスは、この「契約」を忠実に守らなければなりません。もし派生クラスがこの契約を破ると、使う側の「期待」を裏切ることになり、プログラムの予測可能性や信頼性が損なわれます。

したがって、インターフェースや基底クラスの設計者は、その契約内容（事前条件、事後条件、不変条件）を**Javadoc コメントなどで明確に明文化する**ことが強く推奨されます。そして、派生クラスの実装者は、その明文化された契約を完全に遵守する責任があります。

LSP は、健全な継承関係を築き、柔軟で保守性の高いシステムを構築するための土台となる、非常に重要な原則なのです。

はい、承知いたしました。これまでの議論を踏まえ、契約による設計（Design by Contract: DbC）における「暗黙的契約」と「明示的契約」の示し方、および「コードによる契約チェックの手法」について、具体的な Java コード例を交えながら体系的にまとめます。

---

## 契約による設計 (Design by Contract: DbC) とその表現方法

契約による設計 (DbC) は、ソフトウェアコンポーネントが互いにどのように振る舞うべきかについて、明確な「契約」を定義する考え方です。この契約は、主に事前条件、事後条件、不変条件の 3 つの要素で構成されます。

これらの契約をコードベースでどのように表現するかは、その契約の重要度、期待される強制力、そして実行時のパフォーマンス要件によって異なります。

### 1. 契約の種類と LSP における役割

| 契約の種類   | 定義                                                                           | LSP におけるルール                                                                                   |
| :----------- | :----------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **事前条件** | メソッドが実行される前に、呼び出し側（クライアント）が満たすべき条件。         | 派生クラスの事前条件は、基底クラスのそれと**同じか、より緩く**できる。**厳しくすることはできない。** |
| **事後条件** | メソッドが正常に完了した後に、呼び出される側（サプライヤー）が保証すべき条件。 | 派生クラスの事後条件は、基底クラスのそれと**同じか、より厳しく**できる。**緩くすることはできない。** |
| **不変条件** | クラスのインスタンスが、常に満たしていなければならない状態。                   | 派生クラスは、基底クラスの不変条件を**維持**しなければならない。                                     |

### 2. 契約の表現方法：暗黙的 vs. 明示的

契約は、コード上に直接書かれていなくても存在します（暗黙的契約）。しかし、LSP を確実に遵守し、システムの信頼性を高めるためには、契約を**明示的**にすることが非常に重要です。

#### 2.1. 暗黙的契約

コードに直接記述されていないが、型の名称、メソッド名、引数の型、または一般的なドメイン知識や慣習から開発者が「期待する」振る舞い。

- **例:**

  - `List<E>.add(E element)`: 「要素がリストの末尾に追加される」という事後条件が暗黙的に期待される。
  - `BankAccount.balance`: 「残高は負にならない」という不変条件が金融ドメインの常識として暗黙的に期待される。
  - `String.length()`: 「文字列の長さを返す」という事後条件が暗黙的に期待される。

- **問題点:**
  - 開発者によって解釈が異なり、認識のずれが生じやすい。
  - LSP 違反が発生しやすくなる（特に派生クラスが意図せず暗黙の契約を破る）。
  - コードレビューやドキュメントがなければ、契約を正確に把握するのが難しい。

#### 2.2. 明示的契約

コードのコメント、アノテーション、または実際のコードとして明確に記述された契約。LSP においては、特に基底クラスやインターフェースの契約を明示することが極めて重要です。

### 3. 明示的契約の記述方法とコード例

明示的な契約は、主に以下の 3 つの方法で記述・強制されます。

#### 3.1. Javadoc コメントによる明文化（人間向けの記述）

これは、開発者が契約を理解するための最も一般的な方法です。

- **手法:** メソッド、クラス、フィールドの Javadoc コメントに、`@param`, `@return`, `@throws` の標準タグに加えて、`@precondition`, `@postcondition`, `@invariant` といったカスタムタグや、シンプルな文章で契約条件を記述します。
- **利点:**
  - 人間の開発者が契約を理解しやすい。
  - IDE やドキュメント生成ツールが利用でき、契約を一元的に把握できる。
  - 柔軟性が高く、複雑な契約も記述可能。
- **欠点:** コンパイラによる強制力がないため、コメントと実装が乖離するリスクがある。

**コード例:**

```java
import java.util.List;
import java.util.ArrayList;

/**
 * 汎用的な数値リスト処理を行う基底クラス。
 * **不変条件:** このクラスのインスタンスは、常に有効な数値リストを保持している。
 */
class NumberListProcessor {
    // 実際にリストを保持する場合、不変条件はフィールドに適用される
    protected List<Integer> numbers;

    /**
     * コンストラクタ。初期リストを受け取ります。
     * @param initialNumbers 初期化する数値リスト。nullであってはなりません。
     *                       **事前条件:** initialNumbers は null であってはならない。要素はnullを含まない。
     * @throws IllegalArgumentException initialNumbers が null の場合。
     */
    public NumberListProcessor(List<Integer> initialNumbers) {
        if (initialNumbers == null) { // 事前条件のコードチェック
            throw new IllegalArgumentException("Initial numbers list cannot be null.");
        }
        this.numbers = new ArrayList<>(initialNumbers);
        // 不変条件の確認 (コンストラクタ終了時)
        // assert this.numbers != null && !this.numbers.contains(null) : "Invariant violated: numbers list or its elements are invalid.";
    }

    /**
     * リスト内の全ての数値を合計します。
     *
     * @return リスト内の数値の合計値。
     *         **事後条件:** 戻り値はリスト内の全ての数値の合計と等しい。
     *         リストが空の場合は0を返します。
     */
    public int sumAllNumbers() {
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        return sum;
    }

    /**
     * リストから偶数のみをフィルタリングします。
     *
     * @return 偶数のみを含む新しいリスト。
     *         **事後条件:** 返されるリストには偶数のみが含まれ、元のリストの順序は変更されません。
     *                      元のリストの不変条件は維持されます。
     */
    public List<Integer> filterEvenNumbers() {
        List<Integer> evens = new ArrayList<>();
        for (int num : numbers) {
            if (num % 2 == 0) {
                evens.add(num);
            }
        }
        return evens;
    }
}
```

#### 3.2. コードによる強制（実行時チェック）

契約は、プログラムの実行時にその条件が守られているかをチェックするコードを記述することで、より強力に強制されます。

##### a. 例外 (Exceptions) によるチェック

最も一般的で、本番環境でも有効な契約チェック方法です。契約違反が検出された場合、適切な例外をスローしてプログラムに問題を伝えます。

- **手法:**
  - **事前条件:** メソッドの先頭で引数やオブジェクトの状態をチェックし、違反があれば `IllegalArgumentException`, `NullPointerException`, `IllegalStateException` などをスローします。
  - **事後条件:** メソッドの最後に、戻り値やオブジェクトの状態が期待通りかを確認し、`IllegalStateException` などで違反をスローします。
  - **不変条件:** コンストラクタや状態を変更するメソッド（setter など）の前後で、オブジェクトの内部状態が有効であるかを確認し、`IllegalStateException` などをスローします。

**コード例 (BankAccount の`withdraw`メソッドに焦点を当てて)**

```java
/**
 * 銀行口座のクラス。
 * **不変条件:** この口座の残高 (balance) は、いかなる操作の前後でも常に0.0以上である。
 */
class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        // 事前条件のコードによる強制: 初期残高が負でないこと
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative.");
        }
        this.balance = initialBalance;
        // 不変条件のチェック: コンストラクタ終了時の残高が0以上であることを保証
        // (ここでは例外をスローするほどではないと判断し、後述のアサーションを使うことも多い)
        if (this.balance < 0) throw new IllegalStateException("Invariant violated: Balance became negative after construction.");
    }

    /**
     * 口座から出金します。
     * @param amount 出金額
     *               **事前条件:** amountは0以上であり、かつ現在の残高を超過しないこと。
     * @throws IllegalArgumentException 出金額が負の場合、または残高不足の場合。
     * @postcondition 口座残高が出金額分減少している。不変条件 (balance >= 0) は維持される。
     */
    public void withdraw(double amount) {
        // 事前条件のコードによる強制: amountが0以上であること
        if (amount < 0) {
            throw new IllegalArgumentException("Withdraw amount cannot be negative.");
        }
        // 事前条件のコードによる強制: 残高不足でないこと (同時に不変条件が破られないためのチェック)
        if (this.balance - amount < 0) {
            throw new IllegalArgumentException("Insufficient funds.");
        }

        double oldBalance = this.balance; // 事後条件チェックのために以前の残高を保持
        this.balance -= amount;

        // 事後条件のコードによる強制: 残高が正しく更新されたことを保証
        // (浮動小数点数の比較は注意が必要だが、ここでは簡略化)
        if (this.balance != oldBalance - amount) {
             throw new IllegalStateException("Postcondition violated: Balance not updated correctly.");
        }
        // 不変条件のコードによる強制: メソッド終了時の残高が0以上であることを保証
        if (this.balance < 0) {
            throw new IllegalStateException("Invariant violated: Balance became negative after withdrawal.");
        }
    }

    public double getBalance() { return balance; }
}
```

##### b. Java の`assert`文によるチェック（開発時・デバッグ時向け）

`assert`文は、開発時やテスト時にのみ有効化される「内部的な」契約チェックに適しています。本番環境では通常無効化されます。

- **手法:** `assert condition : "message";` の形式で、プログラムが特定の時点である状態を仮定していることをコードに明記します。違反すると `AssertionError` をスローします。
- **利点:** 開発時の厳密なチェックに役立ち、本番環境のパフォーマンスに影響を与えない。内部ロジックの仮定をコードに明示的に残せる。
- **欠点:** 本番環境で無効化されるとチェックされないため、重要な契約には例外を用いるべき。

**コード例 (前述の`BankAccount`を`assert`で):**

```java
// コンパイル時や実行時に -ea (enable assertions) オプションを付けることで有効化
class BankAccountWithAssert {
    private double balance;

    public BankAccountWithAssert(double initialBalance) {
        if (initialBalance < 0) { throw new IllegalArgumentException("Initial balance cannot be negative."); }
        this.balance = initialBalance;
        assert balance >= 0 : "Invariant violation: Balance must be non-negative after construction."; // 不変条件
    }

    public void withdraw(double amount) {
        if (amount < 0) { throw new IllegalArgumentException("Withdraw amount cannot be negative."); }
        if (this.balance - amount < 0) { throw new IllegalArgumentException("Insufficient funds."); }

        double oldBalance = this.balance;
        this.balance -= amount;

        assert this.balance == oldBalance - amount : "Postcondition violated: Balance not updated correctly."; // 事後条件
        assert balance >= 0 : "Invariant violation: Balance must be non-negative after withdrawal."; // 不変条件
    }

    public double getBalance() { return balance; }
}
```

##### c. Parameter Object / Value Object による事前条件・不変条件の強制

Parameter Object パターンと Value Object を組み合わせることで、メソッドの事前条件の一部を、引数オブジェクト自身の不変条件として強制できます。

- **手法:**
  - 複数の関連する引数をまとめたイミュータブルなクラス（Value Object）を作成します。
  - その Value Object のコンストラクタで、受け取る値の有効性（事前条件）を厳密にチェックし、無効であれば例外をスローします。
  - 一度有効な状態で生成された Value Object は、その後不正な状態になることがない（不変条件を常に満たす）ように設計します。
- **利点:**
  - メソッドのシグネチャが簡潔になる。
  - 契約チェックのロジックがパラメータオブジェクトにカプセル化され、再利用性が高まる。
  - **早期失敗 (Fail Fast)**: 不正なデータがシステム深くまで伝播する前に検出できる。
  - 呼び出し側は、有効なパラメータオブジェクトを渡すだけで、その中の値の整合性を信頼できる。

**コード例 (検索条件の Parameter Object)**

```java
// SearchCriteria.java (Value Objectとして設計)
final class SearchCriteria { // finalで不変性を強化
    private final String keyword;
    private final double minPrice;
    private final double maxPrice;
    private final int pageSize;
    private final int pageNumber;

    /**
     * 検索条件を生成します。
     * **事前条件:** minPrice >= 0, maxPrice >= minPrice, pageSize > 0, pageNumber >= 0。
     * @throws IllegalArgumentException いずれかの事前条件が満たされない場合。
     * **不変条件:** 生成されたSearchCriteriaオブジェクトは、常に有効な検索条件を保持し、不変である。
     */
    public SearchCriteria(String keyword, double minPrice, double maxPrice,
                          int pageSize, int pageNumber) {
        // コンストラクタで全ての事前条件をコードとして強制
        if (minPrice < 0) { throw new IllegalArgumentException("Minimum price cannot be negative."); }
        if (maxPrice < minPrice) { throw new IllegalArgumentException("Maximum price cannot be less than minimum price."); }
        if (pageSize <= 0) { throw new IllegalArgumentException("Page size must be positive."); }
        if (pageNumber < 0) { throw new IllegalArgumentException("Page number cannot be negative."); }
        // keywordのnull/空文字チェックなどもここで行う

        this.keyword = keyword;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.pageSize = pageSize;
        this.pageNumber = pageNumber;
    }

    // ゲッターのみ提供 (不変性を保証)
    public String getKeyword() { return keyword; }
    public double getMinPrice() { return minPrice; }
    public double getMaxPrice() { return maxPrice; }
    public int getPageSize() { return pageSize; }
    public int getPageNumber() { return pageNumber; }

    // Value Objectとして equals() と hashCode() を適切に実装する
    @Override
    public boolean equals(Object o) { /* ... */ }
    @Override
    public int hashCode() { /* ... */ }
    @Override
    public String toString() { /* ... */ }
}

// ProductSearchService.java
class ProductSearchService {
    /**
     * 検索条件に基づいて商品を検索します。
     * @param criteria 検索条件。**事前条件:** criteriaは有効なSearchCriteriaオブジェクトであること。
     *                 （これはSearchCriteriaのコンストラクタによって保証される）
     * @return 検索結果の商品のリスト。
     *         **事後条件:** 戻り値のリストはcriteriaに合致する商品のみを含み、nullではない。
     */
    public List<Product> searchProducts(SearchCriteria criteria) {
        // SearchCriteriaオブジェクトが有効な状態であることが保証されているため、
        // メソッド内で再度引数の有効性チェックは不要（または最小限で済む）
        System.out.println("Searching products with: " + criteria.toString());
        // ... 検索ロジック ...
        return new ArrayList<>(); // 例として空リストを返す
    }
}
```

### 結論：最適な組み合わせ

契約による設計は、単一の手法に依存するのではなく、それぞれの利点と欠点を理解し、状況に応じて最適な組み合わせを用いることで最も効果を発揮します。

1.  **Javadoc コメント:** 人間向けのコミュニケーションとして、契約の意図を明確に記述する。
2.  **例外によるチェック:** 重要なビジネスロジックや公開 API の契約で、**本番環境でも強制されるべき**契約違反を検出するために用いる。
3.  **`assert`文:** 開発時やテスト時の**内部的な整合性チェック**や、複雑なアルゴリズムの仮定をコードに残すために用いる。本番環境では無効化してパフォーマンスを確保する。
4.  **Parameter Object / Value Object:** メソッドの事前条件やデータオブジェクト自体の不変条件を**コードとしてカプセル化し強制する**ことで、コードをクリーンにし、早期失敗を促す。

これらの手法を適切に使い分けることで、LSP を含む SOLID 原則を遵守し、より堅牢で、理解しやすく、保守性の高いソフトウェアを構築することができます。
