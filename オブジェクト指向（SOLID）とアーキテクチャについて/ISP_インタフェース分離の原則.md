## インタフェース分離の原則 (ISP: Interface Segregation Principle) の整理

### 1. ISP とは何か？

ISP（インタフェース分離の原則）は、SOLID 原則の一つで、「**クライアントが利用しないメソッドへの依存を強制してはならない**」と定義されます。簡単に言えば、「**使う人に合わせた、小さくて専門的なインタフェースに分けましょう**」という原則です。

- **目的**:
  - クライアントが本当に必要なメソッドだけを知っていれば良い状態を作る。
  - 不要なメソッドへの依存をなくすことで、システムの結合度を低減させる。
  - 実装クラスが不要なメソッドを実装する義務から解放される。
  - 変更の影響範囲を局所化し、保守性・拡張性を高める。
- **「分離」の視点**: SRP がクラスの「責任」に基づいてクラスを分割するのに対し、ISP はクライアントの「利用する機能」に基づいてインタフェースを分割します。

### 2. ISP 違反の具体例

一つの巨大なインタフェース（ファットインタフェース）は ISP 違反の典型です。

#### 例：多機能プリンターのインタフェース

```java
// ISP違反の例：多機能プリンターのファットインタフェース
interface MultiFunctionDevice {
    void print(String document);
    void scan(String document);
    void fax(String document);
    void copy(String document);
    void staple(String document); // ホチキス留め
}

// 簡易プリンター
class SimplePrinter implements MultiFunctionDevice {
    @Override
    public void print(String document) {
        System.out.println("印刷中: " + document);
    }

    @Override
    public void scan(String document) {
        throw new UnsupportedOperationException("このデバイスはスキャンできません。"); // ISP違反！
    }

    @Override
    public void fax(String document) {
        throw new UnsupportedOperationException("このデバイスはFAX送信できません。"); // ISP違反！
    }

    @Override
    public void copy(String document) {
        throw new UnsupportedOperationException("このデバイスはコピーできません。"); // ISP違反！
    }

    @Override
    public void staple(String document) {
        throw new UnsupportedOperationException("このデバイスはホチキス留めできません。"); // ISP違反！
    }
}

// 複合機
class AllInOnePrinter implements MultiFunctionDevice {
    @Override
    public void print(String document) {
        System.out.println("複合機で印刷中: " + document);
    }

    @Override
    public void scan(String document) {
        System.out.println("複合機でスキャン中: " + document);
    }

    @Override
    public void fax(String document) {
        System.out.println("複合機でFAX送信中: " + document);
    }

    @Override
    public void copy(String document) {
        System.out.println("複合機でコピー中: " + document);
    }

    @Override
    public void staple(String document) {
        System.out.println("複合機でホチキス留め中: " + document);
    }
}
```

`SimplePrinter` は `print()` 以外のメソッドを実装する必要がないにも関わらず、`MultiFunctionDevice` インタフェースを実装するために `UnsupportedOperationException` をスローするコードを多数記述しています。これは以下の問題を引き起こします。

- **無駄な実装**: `SimplePrinter` にとって不要なメソッドの実装が強制される。
- **クライアントへの混乱**: `SimplePrinter` オブジェクトを `MultiFunctionDevice` 型として扱ったクライアントは、`scan()` を呼び出して例外に遭遇する可能性がある。
- **保守性の低下**: `MultiFunctionDevice` に新しいメソッドが追加されるたびに、`SimplePrinter` もそのメソッドを実装（または例外をスロー）し直す必要がある。

### 3. ISP に準拠した設計

上記の例を ISP に準拠させるには、機能を小さく分割したインタフェースを用意します。

#### 例：多機能プリンターのインタフェース分離

```java
// ISP準拠の例：機能を分割したインタフェース群
interface Printer {
    void print(String document);
}

interface Scanner {
    void scan(String document);
}

interface FaxMachine {
    void fax(String document);
}

interface Copier {
    void copy(String document);
}

interface Stapler {
    void staple(String document);
}

// 簡易プリンター (Printerインタフェースのみ実装)
class SimplePrinterISP implements Printer {
    @Override
    public void print(String document) {
        System.out.println("印刷中: " + document);
    }
}

// スキャン機能付きプリンター (PrinterとScannerインタフェースを実装)
class ScanPrinterISP implements Printer, Scanner {
    @Override
    public void print(String document) {
        System.out.println("印刷中: " + document);
    }

    @Override
    public void scan(String document) {
        System.out.println("スキャン中: " + document);
    }
}

// 複合機 (全てのインタフェースを実装)
class AllInOnePrinterISP implements Printer, Scanner, FaxMachine, Copier, Stapler {
    @Override
    public void print(String document) {
        System.out.println("複合機で印刷中: " + document);
    }

    @Override
    public void scan(String document) {
        System.out.println("複合機でスキャン中: " + document);
    }

    @Override
    public void fax(String document) {
        System.out.println("複合機でFAX送信中: " + document);
    }

    @Override
    public void copy(String document) {
        System.out.println("複合機でコピー中: " + document);
    }

    @Override
    public void staple(String document) {
        System.out.println("複合機でホチキス留め中: " + document);
    }
}

// クライアントコードの例
public class IspDemo {
    public static void main(String[] args) {
        // プリンターとしてのみ利用
        Printer printer = new SimplePrinterISP();
        printer.print("レポート.pdf");
        // printer.scan("写真.jpg"); // コンパイルエラー！Printer型にはscan()がないため、誤って呼び出す心配がない。

        // スキャナーとしてのみ利用
        Scanner scanner = new ScanPrinterISP();
        scanner.scan("領収書.jpg");
        // scanner.print("文書.txt"); // コンパイルエラー！Scanner型にはprint()がない。

        // 全機能を持つ複合機として利用
        AllInOnePrinterISP fullDevice = new AllInOnePrinterISP();
        fullDevice.print("契約書.docx");
        fullDevice.scan("図面.dwg");
        fullDevice.fax("注文書.pdf");
    }
}
```

この設計により、各クラスは必要なインタフェースのみを実装し、クライアントも必要な機能に対応するインタフェース型でオブジェクトを扱えるため、より堅牢で理解しやすいコードになります。

### 4. ISP と多重継承（多重インタフェース実装）

Java ではクラスの多重継承はできませんが、インタフェースは複数実装できます（多重インタフェース実装）。ISP で分割された小さなインタフェース群は、クラスが複数の「役割」を担うことを可能にし、多重継承に似た効果（複数の型を持つ）をもたらします。

上記の例で `AllInOnePrinterISP` は `Printer`, `Scanner`, `FaxMachine`, `Copier`, `Stapler` という複数のインタフェースを実装しており、各インタフェースが提供する機能の型として振る舞うことができます。

### 5. ISP とコンポジション (Strategy パターン)

ISP は、オブジェクトの振る舞いを柔軟に切り替える Strategy パターンと非常に相性が良いです。Strategy パターンでは、アルゴリズム（振る舞い）をインタフェースとして抽出し、具体的なアルゴリズムを実装するクラスを用意します。このとき、抽出されるインタフェースは通常小さく、特定の振る舞いに特化しているため、ISP に準拠しています。

#### 例：プレイヤーキャラクターの攻撃と移動

```java
// 攻撃の振る舞いを定義するインタフェース (ISP準拠)
interface AttackBehavior {
    void attack();
}

class SwordAttack implements AttackBehavior {
    @Override
    public void attack() {
        System.out.println("剣で斬りつける！");
    }
}

class MagicAttack implements AttackBehavior {
    @Override
    public void attack() {
        System.out.println("魔法を唱える！");
    }
}

// 移動の振る舞いを定義するインタフェース (ISP準拠)
interface MoveBehavior {
    void move();
}

class WalkMove implements MoveBehavior {
    @Override
    public void move() {
        System.out.println("歩いて移動する。");
    }
}

class FlyMove implements MoveBehavior {
    @Override
    public void move() {
        System.out.println("空を飛んで移動する！");
    }
}

// プレイヤーキャラクター (コンポジションとStrategyパターンを使用)
class PlayerCharacter {
    private AttackBehavior attackBehavior;
    private MoveBehavior moveBehavior;

    public PlayerCharacter(AttackBehavior attackBehavior, MoveBehavior moveBehavior) {
        this.attackBehavior = attackBehavior;
        this.moveBehavior = moveBehavior;
    }

    // 攻撃方法を変更するセッター
    public void setAttackBehavior(AttackBehavior attackBehavior) {
        this.attackBehavior = attackBehavior;
    }

    // 移動方法を変更するセッター
    public void setMoveBehavior(MoveBehavior moveBehavior) {
        this.moveBehavior = moveBehavior;
    }

    // 委譲されたメソッド
    public void performAttack() {
        attackBehavior.attack();
    }

    public void performMove() {
        moveBehavior.move();
    }
}

// クライアントコード
public class StrategyPatternDemo {
    public static void main(String[] args) {
        // 初期状態：剣士（歩行）
        PlayerCharacter warrior = new PlayerCharacter(new SwordAttack(), new WalkMove());
        System.out.println("剣士:");
        warrior.performAttack(); // 剣で斬りつける！
        warrior.performMove();  // 歩いて移動する。

        System.out.println("---");

        // 魔法使いに転職（攻撃方法を変更）
        warrior.setAttackBehavior(new MagicAttack());
        System.out.println("魔法使いに転職後:");
        warrior.performAttack(); // 魔法を唱える！
        warrior.performMove();  // 歩いて移動する。

        System.out.println("---");

        // 飛行能力を習得（移動方法を変更）
        warrior.setMoveBehavior(new FlyMove());
        System.out.println("飛行能力習得後:");
        warrior.performAttack(); // 魔法を唱える！
        warrior.performMove();  // 空を飛んで移動する！
    }
}
```

この例では、`AttackBehavior` と `MoveBehavior` という ISP に準拠した小さなインタフェースが定義されています。`PlayerCharacter` はこれらのインタフェースをコンポジション（委譲）で利用することで、実行時にキャラクターの振る舞い（攻撃方法や移動方法）を柔軟に変更できます。クライアントは `PlayerCharacter` の単一のインタフェース（`performAttack()`, `performMove()`）を通じて、これらの振る舞いを呼び出せます。

### 6. ISP 違反が LSP 違反を引き起こす可能性

ISP に違反した巨大なインタフェースの場合、サブクラスがそのインタフェースの全てのメソッドを意味のある形で実装できないことがあります。その結果、不要なメソッドで `UnsupportedOperationException` をスローしたり、何もしないダミーの実装をしたりすることがあります。このような「退化した」メソッドを持つサブクラスは、LSP（Liskov Substitution Principle：リスコフの置換原則）に違反する可能性があります。

**LSP**: 「プログラム中のオブジェクトは、そのサブクラスのオブジェクトと置き換えることができなければならない。それによってプログラムの正しさが変わるべきではない。」

#### 例：ISP 違反による LSP 違反

先ほどの `MultiFunctionDevice` と `SimplePrinter` の例を再利用します。

```java
// MultiFunctionDeviceとSimplePrinterは前述のISP違反の例と同じ

public class LspViolationFromIspViolationDemo {
    public static void processDevice(MultiFunctionDevice device) {
        // クライアントコードは、MultiFunctionDevice型として渡されたオブジェクトが
        // 全ての機能を正常に実行できると期待するかもしれない
        device.print("テスト文書");
        System.out.println("印刷完了");

        try {
            device.scan("テスト写真");
            System.out.println("スキャン完了");
        } catch (UnsupportedOperationException e) {
            System.out.println("スキャンできませんでした: " + e.getMessage());
            // この例外処理は、LSP違反を回避するための対処だが、本来は不要なはずのチェック
        }
        // 他のメソッドについても同様の例外処理が必要になる
    }

    public static void main(String[] args) {
        MultiFunctionDevice fullFeatured = new AllInOnePrinter();
        MultiFunctionDevice simpleDevice = new SimplePrinter();

        System.out.println("--- 複合機の場合 ---");
        processDevice(fullFeatured); // スキャンも正常に動作

        System.out.println("\n--- 簡易プリンターの場合 ---");
        processDevice(simpleDevice); // スキャンでUnsupportedOperationExceptionが発生
        // クライアントは、MultiFunctionDevice型であれば常にスキャンができると期待すると、
        // SimplePrinterに置き換えたときにプログラムの「正しさ」（期待される振る舞い）が変わる
    }
}
```

`processDevice` メソッドは `MultiFunctionDevice` 型の引数を受け取ります。もしクライアントが「`MultiFunctionDevice` であれば `scan()` も正常に動作する」と期待していた場合、`SimplePrinter` オブジェクトに置き換えた途端に `UnsupportedOperationException` が発生し、プログラムの期待する動作が壊れてしまいます。これは、`SimplePrinter` が `MultiFunctionDevice` の（暗黙の）契約（全てのメソッドが有効に機能すること）を満たしていないため、LSP 違反となります。

ISP に準拠し、`Printer` と `Scanner` を分離していれば、`processDevice` のようなメソッドは `Printer` または `Scanner` のどちらかの型で引数を受け取り、適切な操作のみを呼び出すため、このような問題は発生しません。

### 7. クライアントが使わないメソッドを公開しない理由

「クライアントが使わないメソッドは公開しない方がいい」という考え方は、以下の原則で説明できます。

- **フールプルーフ (Fool-proof)**:

  - **意味**: どんなに不注意なユーザー（開発者）が使っても、誤った操作ができない、あるいはしても問題が起きないように設計すること。
  - **ISP との関連**: ISP に従ってインタフェースを分割することで、クライアントは自分が使う必要のないメソッドを「見ることすらできない」ようになります。これにより、誤って不要なメソッドを呼び出し、`UnsupportedOperationException` に遭遇したり、意図しない副作用を引き起こしたりするリスクを排除できます。クライアントは、自身の関心事（ドメイン）に必要な情報だけに集中できるため、認知負荷も軽減されます。

- **Hyrum の法則 (Hyrum's Law)**:
  - **法則**: 「十分な数のユーザーがいるなら、API のどのような挙動であっても、誰かがそれに依存する。」
  - **ISP との関連**: ISP に違反して不要なメソッドが公開されている場合、たとえそのメソッドが「使うべきではない」と設計者が意図していても、誰かがそのメソッドの振る舞い（例えば、特定の引数で例外をスローすること）に依存してコードを書いてしまう可能性があります。
  - 例えば、「`Printer` オブジェクトで `scan()` を呼び出すと必ず `UnsupportedOperationException` が発生する」という挙動に依存して、特定の条件下でのエラーハンドリングを実装するようなクライアントが現れるかもしれません。もし将来、`Printer` にスキャン機能が追加されて `scan()` が例外をスローしなくなった場合、そのクライアントコードは壊れてしまいます。
  - ISP によって不要なメソッドを公開しないことで、このような意図しない、かつ壊れやすい依存関係の発生を未然に防ぎ、システムの変更耐性を高めることができます。

### まとめ（再確認）

ISP は、インタフェースを「クライアントの必要性」に応じて小さく分割することで、システムの保守性、拡張性、理解しやすさを高める重要な原則です。ISP を順守することで、LSP 違反のリスクを減らし、フールプルーフな設計を促進し、Hyrum の法則による予期せぬ依存関係を防ぐことができます。適切なインタフェース設計は、堅牢で進化し続けるソフトウェアを構築するための基盤となります。
