### SOLID 原則 O：OCP（オープン・クローズドの原則）

**原則の概要:**
クラスや関数、モジュールなどは、**拡張に対しては開かれていなければならず、修正に対しては閉じられていなければならない**という原則です。

これはどういうことかというと、新しい機能を追加したいときに、既存のコードを修正することなく、新しいコードを追加することで対応できるような設計を目指すということです。既存のコードを修正すると、思わぬバグを生み出す可能性があり、テストの手間も増えます。

> ⇒ 変更されやすいクラスに依存せず、変更されにくいインタフェースに依存することで、機能追加の際に既存クラスの修正が不要になる
> ただし、変更を見越して OCP をなんにでも適用するのはちょっと stop。コードが増えるとメンテナンスコストが嵩むので、メリットが上回るかを常に考えよう
> 基本 strategy で、組み合わせができる場合は decorator と

**なぜ重要か:**

- **保守性の向上:** 既存コードの修正が減るため、バグが混入するリスクが減ります。
- **拡張性の向上:** 新しい機能の追加が容易になります。
- **柔軟性の向上:** 変化に強いシステムを構築できます。

**具体例:**
割引計算を例に考えてみましょう。

**OCP に違反する例:**

```java
class PriceCalculator {
    public double calculate(double price, String discountType) {
        if ("通常割引".equals(discountType)) {
            return price * 0.9;
        } else if ("特別割引".equals(discountType)) {
            return price * 0.8;
        }
        // 新しい割引が追加されたら、このメソッドを修正する必要がある
        return price;
    }
}
```

この`PriceCalculator`クラスは、新しい割引タイプが追加されるたびに`calculate`メソッドを修正する必要があります。これは OCP に違反しています。

**OCP に従う例:**
インターフェースを導入し、割引の種類を抽象化します。

```java
// 割引戦略のインターフェース
interface DiscountStrategy {
    double applyDiscount(double price);
}

// 通常割引の具体的な戦略
class RegularDiscount implements DiscountStrategy {
    @Override
    public double applyDiscount(double price) {
        return price * 0.9;
    }
}

// 特別割引の具体的な戦略
class SpecialDiscount implements DiscountStrategy {
    @Override
    public double applyDiscount(double price) {
        return price * 0.8;
    }
}

// 割引を適用するクラス
class PriceCalculator {
    private DiscountStrategy strategy;

    // 依存するのは変更されやすいクラスではなく、変更されにくいインタフェース
    // これにより、OCPを実現できる
    public PriceCalculator(DiscountStrategy strategy) {
        this.strategy = strategy;
    }

    public double calculate(double price) {
        return strategy.applyDiscount(price);
    }

    // 必要であれば戦略を途中で変更することも可能
    public void setDiscountStrategy(DiscountStrategy strategy) {
        this.strategy = strategy;
    }
}

// 利用例
public class OCPExample {
    public static void main(String[] args) {
        PriceCalculator calculator1 = new PriceCalculator(new RegularDiscount());
        System.out.println("通常割引適用後の価格: " + calculator1.calculate(1000)); // 900.0

        PriceCalculator calculator2 = new PriceCalculator(new SpecialDiscount());
        System.out.println("特別割引適用後の価格: " + calculator2.calculate(1000)); // 800.0

        // 新しい割引タイプが追加されても、PriceCalculatorクラスは修正不要
        // 例: プレミアム割引
        // class PremiumDiscount implements DiscountStrategy { ... }
        // PriceCalculator calculator3 = new PriceCalculator(new PremiumDiscount());
    }
}
```

この例では、`PriceCalculator`は`DiscountStrategy`インターフェースに依存しており、具体的な割引の実装には依存していません。新しい割引を追加したい場合は、`DiscountStrategy`インターフェースを実装する新しいクラスを作成するだけでよく、`PriceCalculator`クラスを修正する必要がありません。これが OCP です。

---

### Strategy パターン

**パターンの概要:**
アルゴリズムのファミリーを定義し、それぞれを独立したクラスにカプセル化し、それらを交換可能にするデザインパターンです。これにより、アルゴリズムを使用するクライアントからアルゴリズムの実装を切り離すことができます。

**目的:**

- アルゴリズムを動的に変更できるようにする。
- アルゴリズムの追加や変更が容易になる。
- 複雑な条件分岐を避ける。

**OCP との関係:**
Strategy パターンは、OCP を実践するための具体的な手段の一つです。上記 OCP の例で示した割引計算の例は、まさに Strategy パターンを適用したものです。割引計算という「アルゴリズム」を`DiscountStrategy`というインターフェースで抽象化し、具体的な割引方法をそれぞれの実装クラス（`RegularDiscount`, `SpecialDiscount`など）に委譲しています。

**構造:**

- **Strategy (戦略):** アルゴリズムのインターフェースを定義します。
- **Concrete Strategy (具象戦略):** Strategy インターフェースを実装し、具体的なアルゴリズムを提供します。
- **Context (コンテキスト):** Strategy オブジェクトを保持し、その Strategy オブジェクトにアルゴリズムの実行を委譲します。クライアントは Context とやり取りします。

**具体例 (上記の割引計算の例とほぼ同じです):**
`DiscountStrategy`が Strategy、`RegularDiscount`や`SpecialDiscount`が Concrete Strategy、`PriceCalculator`が Context に該当します。

**シーケンス図のイメージ:**
ユーザーが`PriceCalculator`に割引適用を依頼する
-> `PriceCalculator`は自身の持つ`DiscountStrategy`オブジェクトの`applyDiscount`メソッドを呼び出す
-> `ConcreteDiscountStrategy`が実際の割引計算を実行し、結果を返す

---

### Decorator パターン

**パターンの概要:**
オブジェクトに動的に新しい振る舞い（機能）を追加するデザインパターンです。サブクラス化（継承）の代わりに、オブジェクトを「ラップ」することで機能を追加します。これにより、機能追加の柔軟性が増し、クラス爆発（機能の組み合わせによってクラスが大量に増えること）を防ぐことができます。

**目的:**

- オブジェクトに動的に機能を追加する。
- 機能の組み合わせを柔軟に行う。
- 継承による機能追加の欠点（静的な機能追加、クラス爆発）を避ける。

**OCP との関係:**
Decorator パターンもまた、OCP を実践するための強力な手段です。既存のクラスを修正することなく、新しい機能（装飾）を追加できるため、拡張には開かれ、修正には閉じられている状態を実現します。

**構造:**

- **Component (コンポーネント):** デコレーターと装飾されるオブジェクトの両方が実装するインターフェースを定義します。
- **Concrete Component (具象コンポーネント):** 装飾される元のオブジェクトです。基本的な振る舞いを実装します。
- **Decorator (デコレーター):** Component インターフェースを実装し、Component 型のオブジェクトを保持します。このクラス自身は抽象クラスであり、具体的な装飾のベースとなります。
- **Concrete Decorator (具象デコレーター):** Decorator を継承し、新しい振る舞いを追加したり、元の振る舞いを変更したりします。

**具体例:**
コーヒーの注文システムを例に考えてみましょう。
基本的なコーヒーに、ミルク、ホイップクリーム、シロップなどのトッピングを追加していくケースです。

```java
// Component: 飲み物のインターフェース
interface Beverage {
    String getDescription(); // 飲み物の説明
    double getCost();      // 飲み物の価格
}

// Concrete Component: 基本のコーヒー
class SimpleCoffee implements Beverage {
    @Override
    public String getDescription() {
        return "シンプルなコーヒー";
    }

    @Override
    public double getCost() {
        return 200;
    }
}

// Decorator: 飲み物の装飾（抽象デコレーター）
abstract class CondimentDecorator implements Beverage {
    // 装飾される飲み物（Component）を保持
    protected Beverage beverage;

    public CondimentDecorator(Beverage beverage) {
        this.beverage = beverage;
    }

    // デコレーター自身もBeverageなので、getDescriptionとgetCostを実装する必要がある
    // 通常は装飾対象のメソッドを呼び出し、追加の処理を行う
    @Override
    public abstract String getDescription(); // こう書けば具象クラスに実装は任せると明示的に示せる

    @Override
    public abstract double getCost();
}

// Concrete Decorator: ミルクを追加するデコレーター
class Milk extends CondimentDecorator {
    public Milk(Beverage beverage) {
        super(beverage);
    }

    @Override
    public String getDescription() {
        return beverage.getDescription() + ", ミルク"; // 元のdescriptionにミルクを追加
    }

    @Override
    public double getCost() {
        return beverage.getCost() + 50; // 元の価格にミルク代を追加
    }
}

// Concrete Decorator: ホイップクリームを追加するデコレーター
class Whip extends CondimentDecorator {
    public Whip(Beverage beverage) {
        super(beverage);
    }

    @Override
    public String getDescription() {
        return beverage.getDescription() + ", ホイップ";
    }

    @Override
    public double getCost() {
        return beverage.getCost() + 80;
    }
}

// Concrete Decorator: シロップを追加するデコレーター
class Syrup extends CondimentDecorator {
    public Syrup(Beverage beverage) {
        super(beverage);
    }

    @Override
    public String getDescription() {
        return beverage.getDescription() + ", シロップ";
    }

    @Override
    public double getCost() {
        return beverage.getCost() + 70;
    }
}

// 利用例
public class DecoratorExample {
    public static void main(String[] args) {
        // 基本のコーヒー
        Beverage coffee = new SimpleCoffee();
        System.out.println(coffee.getDescription() + "の価格: " + coffee.getCost() + "円"); // シンプルなコーヒーの価格: 200.0円

        // ミルクを追加
        Beverage coffeeWithMilk = new Milk(coffee);
        System.out.println(coffeeWithMilk.getDescription() + "の価格: " + coffeeWithMilk.getCost() + "円"); // シンプルなコーヒー, ミルクの価格: 250.0円

        // ミルクとホイップを追加
        Beverage coffeeWithMilkAndWhip = new Whip(new Milk(coffee));
        System.out.println(coffeeWithMilkAndWhip.getDescription() + "の価格: " + coffeeWithMilkAndWhip.getCost() + "円"); // シンプルなコーヒー, ミルク, ホイップの価格: 330.0円

        // シロップとミルクとホイップを追加（順番は自由）
        Beverage fancyCoffee = new Syrup(new Whip(new Milk(new SimpleCoffee())));
        System.out.println(fancyCoffee.getDescription() + "の価格: " + fancyCoffee.getCost() + "円"); // シンプルなコーヒー, ミルク, ホイップ, シロップの価格: 400.0円
    }
}
```

この例では、`SimpleCoffee`という基本のオブジェクトに、`Milk`や`Whip`、`Syrup`といったデコレーターを組み合わせて、動的に機能（トッピング）を追加しています。新しいトッピングを追加したい場合でも、既存の`Beverage`や`CondimentDecorator`のコードを修正する必要はなく、新しい`CondimentDecorator`の実装クラスを追加するだけで済みます。

---

### まとめ

- **OCP (オープン・クローズドの原則):** 拡張にはオープン、修正にはクローズド。既存のコードをいじらずに機能を追加できる設計を目指します。
- **Strategy パターン:** アルゴリズムをインターフェースで抽象化し、その実装を交換可能にすることで、動的なアルゴリズムの切り替えや OCP の実現に貢献します。
- **Decorator パターン:** オブジェクトをラップすることで、動的に機能を追加・変更し、柔軟な機能拡張と OCP の実現に貢献します。

どちらのデザインパターンも、OCP という大きな原則を達成するための具体的な手段として非常に有効です。Strategy パターンは「どのように振る舞うか（アルゴリズム）」を変更するのに適しており、Decorator パターンは「何ができるか（機能）」を追加するのに適している、と考えると良いでしょう。
