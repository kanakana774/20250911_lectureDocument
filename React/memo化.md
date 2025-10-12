React のメモ化（Memoization）は、コンポーネントの再レンダリングをスキップすることで、アプリケーションのパフォーマンスを最適化する手法です。不要な再レンダリングを防ぐことで、CPU の負荷を軽減し、よりスムーズなユーザーエクスペリエンスを提供します。

ここでは、React のメモ化について、様々なパターンと具体例を TypeScript で網羅的に解説します。

---

### 1. `React.memo` (コンポーネントのメモ化)

`React.memo`は、関数コンポーネントをメモ化するための高階コンポーネント（HOC）です。`React.memo`でラップされたコンポーネントは、props が変更されない限り再レンダリングされません。

#### 基本的な使い方

```typescript
import React from "react";

interface MyComponentProps {
  name: string;
  age: number;
}

const MyComponent: React.FC<MyComponentProps> = ({ name, age }) => {
  console.log("MyComponentがレンダリングされました");
  return (
    <div>
      <p>名前: {name}</p>
      <p>年齢: {age}</p>
    </div>
  );
};

const MemoizedMyComponent = React.memo(MyComponent);

const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const user = { name: "Alice", age: 30 };

  return (
    <div>
      <h1>カウント: {count}</h1>
      <button onClick={() => setCount(count + 1)}>カウントアップ</button>
      <MemoizedMyComponent name={user.name} age={user.age} />
    </div>
  );
};

export default App;
```

**解説:**

- `MemoizedMyComponent`は`React.memo`でラップされています。
- `App`コンポーネントの`count`が変更されても、`MemoizedMyComponent`に渡される`name`と`age`は変化しないため、`MemoizedMyComponent`は再レンダリングされません（コンソールログが出力されません）。
- もし`user`オブジェクトを直接 props に渡すと、参照が常に新しくなるため再レンダリングされてしまいます。後述の`useMemo`や`useCallback`と組み合わせることで解決できます。

#### カスタム比較関数

`React.memo`はデフォルトで、props の浅い比較（shallow comparison）を行います。より複雑な比較ロジックが必要な場合は、第二引数にカスタム比較関数を渡すことができます。

```typescript
import React from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  console.log(`UserCard (${user.name}) がレンダリングされました`);
  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <h3>{user.name}</h3>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
    </div>
  );
};

// カスタム比較関数
const arePropsEqual = (
  prevProps: UserCardProps,
  nextProps: UserCardProps
): boolean => {
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name &&
    prevProps.user.email === nextProps.user.email
  );
};

const MemoizedUserCard = React.memo(UserCard, arePropsEqual);

const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [user, setUser] = React.useState<User>({
    id: 1,
    name: "Bob",
    email: "bob@example.com",
  });

  // 1秒ごとにユーザーのemailを更新 (ただし、idとnameは同じ)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setUser((prevUser) => ({
        ...prevUser,
        email: `bob${Math.random().toFixed(2)}@example.com`,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>カウント: {count}</h1>
      <button onClick={() => setCount(count + 1)}>カウントアップ</button>
      <MemoizedUserCard user={user} />
      <p>
        ユーザーデータは1秒ごとに更新されますが、`MemoizedUserCard`は`id`と`name`が同じ限り再レンダリングされません。
      </p>
    </div>
  );
};

export default App;
```

**解説:**

- `arePropsEqual`関数が`prevProps`と`nextProps`の`user`オブジェクトの`id`, `name`, `email`を深く比較します。
- `App`コンポーネント内で`user`オブジェクトの`email`が頻繁に更新されても、`id`と`name`が変わらなければ`MemoizedUserCard`は再レンダリングされません。
- **注意:** カスタム比較関数は、`true`を返すと再レンダリングをスキップし、`false`を返すと再レンダリングを実行します。デフォルトの`React.memo`とは真偽が逆なので注意してください。

---

### 2. `useMemo` (値のメモ化)

`useMemo`は、計算結果の値をメモ化するためのフックです。依存配列が変更されない限り、重い計算を再実行するのを防ぎます。

#### 基本的な使い方

```typescript
import React from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  products: Product[];
}

const Cart: React.FC<CartProps> = ({ products }) => {
  console.log("Cartがレンダリングされました");

  // useMemoを使って合計金額をメモ化
  const totalAmount = React.useMemo(() => {
    console.log("合計金額を計算中...");
    return products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  }, [products]); // productsが変更されたときのみ再計算

  return (
    <div>
      <h2>ショッピングカート</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.quantity}個 x {product.price}円
          </li>
        ))}
      </ul>
      <h3>合計金額: {totalAmount}円</h3>
    </div>
  );
};

const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [items, setItems] = React.useState<Product[]>([
    { id: 1, name: "りんご", price: 100, quantity: 2 },
    { id: 2, name: "バナナ", price: 150, quantity: 3 },
  ]);

  // 新しい商品をカートに追加する関数 (参照は常に同じになるようにuseCallbackでメモ化すると良い)
  const addProduct = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: prevItems.length + 1,
        name: `商品${prevItems.length + 1}`,
        price: 50 * (prevItems.length + 1),
        quantity: 1,
      },
    ]);
  };

  return (
    <div>
      <h1>カウント: {count}</h1>
      <button onClick={() => setCount(count + 1)}>カウントアップ</button>
      <button onClick={addProduct}>商品を追加</button>
      <Cart products={items} />
    </div>
  );
};

export default App;
```

**解説:**

- `Cart`コンポーネント内の`totalAmount`は`useMemo`でメモ化されています。
- `products`配列が依存配列として指定されているため、`products`が変更されたときのみ`合計金額を計算中...`のログが出力され、再計算が行われます。
- `App`コンポーネントの`count`が変更されても、`products`が変更されない限り`totalAmount`は再計算されません。
- 新しい商品をカートに追加すると`products`の参照が変わるため、`totalAmount`は再計算されます。

#### オブジェクトのメモ化

コンポーネントに props としてオブジェクトを渡す際、オブジェクトの参照が毎回新しくなってしまうと、たとえ中身が同じでも`React.memo`が効かなくなります。`useMemo`を使ってオブジェクトをメモ化することで、この問題を解決できます。

```typescript
import React from "react";

interface DisplaySettings {
  theme: "light" | "dark";
  fontSize: number;
}

interface SettingsDisplayProps {
  settings: DisplaySettings;
}

const SettingsDisplay: React.FC<SettingsDisplayProps> = React.memo(
  ({ settings }) => {
    console.log("SettingsDisplayがレンダリングされました");
    return (
      <div
        style={{ border: "1px dashed blue", padding: "10px", margin: "10px" }}
      >
        <h3>現在の設定:</h3>
        <p>テーマ: {settings.theme}</p>
        <p>フォントサイズ: {settings.fontSize}px</p>
      </div>
    );
  }
);

const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // settingsオブジェクトをuseMemoでメモ化
  const displaySettings: DisplaySettings = React.useMemo(
    () => ({
      theme: theme,
      fontSize: 16,
    }),
    [theme]
  ); // themeが変更されたときのみ新しいオブジェクトを生成

  return (
    <div>
      <h1>カウント: {count}</h1>
      <button onClick={() => setCount(count + 1)}>カウントアップ</button>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        テーマ切り替え
      </button>
      <SettingsDisplay settings={displaySettings} />
    </div>
  );
};

export default App;
```

**解説:**

- `SettingsDisplay`は`React.memo`でラップされています。
- `App`コンポーネント内の`displaySettings`オブジェクトは`useMemo`でメモ化されています。
- `count`が変更されても、`displaySettings`の参照は変わらないため、`SettingsDisplay`は再レンダリングされません。
- `theme`が変更されると`displaySettings`の参照が変わり、`SettingsDisplay`が再レンダリングされます。

---

### 3. `useCallback` (関数のメモ化)

`useCallback`は、関数をメモ化するためのフックです。依存配列が変更されない限り、同じ関数の参照を保持します。これにより、子コンポーネントへの不必要な再レンダリングを防ぐことができます。

#### 基本的な使い方

```typescript
import React from "react";

interface ButtonProps {
  onClick: () => void;
  label: string;
}

// React.memoでラップされた子コンポーネント
const MyButton: React.FC<ButtonProps> = React.memo(({ onClick, label }) => {
  console.log(`MyButton (${label}) がレンダリングされました`);
  return <button onClick={onClick}>{label}</button>;
});

const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [message, setMessage] = React.useState("Hello");

  // handleClick関数をuseCallbackでメモ化
  const handleClick = React.useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []); // 依存配列が空なので、初回レンダリング時に関数オブジェクトが一度だけ生成される

  // handleMessageChange関数をuseCallbackでメモ化
  const handleMessageChange = React.useCallback(() => {
    setMessage((prevMessage) => (prevMessage === "Hello" ? "World" : "Hello"));
  }, []); // 依存配列が空なので、初回レンダリング時に関数オブジェクトが一度だけ生成される

  return (
    <div>
      <h1>カウント: {count}</h1>
      <h2>メッセージ: {message}</h2>
      {/* handleClickとhandleMessageChangeはuseCallbackでメモ化されているため、
          Appが再レンダリングされてもMyButtonに渡される参照は変わらない */}
      <MyButton onClick={handleClick} label="カウントアップ" />
      <MyButton onClick={handleMessageChange} label="メッセージ変更" />
      {/* このボタンをクリックするとAppは再レンダリングされるが、
          MyButtonはhandleClickとhandleMessageChangeの参照が変わらないため再レンダリングされない */}
      <button onClick={() => console.log("親のレンダリング")}>
        親レンダリング
      </button>
    </div>
  );
};

export default App;
```

**解説:**

- `MyButton`は`React.memo`でラップされています。
- `handleClick`と`handleMessageChange`は`useCallback`でメモ化されています。依存配列が空（`[]`）なので、これらの関数の参照はコンポーネントがマウントされてからアンマウントされるまで変わりません。
- `App`コンポーネントが再レンダリングされても、`handleClick`と`handleMessageChange`の参照は同じままなので、`MyButton`は再レンダリングされません。
- もし`useCallback`を使わないと、`App`が再レンダリングされるたびに新しい関数オブジェクトが生成され、`MyButton`は props が変更されたと見なされて再レンダリングされてしまいます。

#### 依存配列に値を含める場合

関数内で外部の state や props を使用する場合は、それらを依存配列に含める必要があります。

```typescript
import React from "react";

interface IncrementButtonProps {
  onIncrement: (amount: number) => void;
  label: string;
}

const IncrementButton: React.FC<IncrementButtonProps> = React.memo(
  ({ onIncrement, label }) => {
    console.log(`IncrementButton (${label}) がレンダリングされました`);
    return <button onClick={() => onIncrement(1)}>{label}</button>;
  }
);

const App: React.FC = () => {
  const [total, setTotal] = React.useState(0);
  const [step, setStep] = React.useState(1);

  // onIncrement関数をuseCallbackでメモ化。stepに依存する。
  const handleIncrement = React.useCallback(
    (amount: number) => {
      setTotal((prevTotal) => prevTotal + amount * step);
    },
    [step]
  ); // stepが変更されたときにのみ、新しい関数オブジェクトが生成される

  return (
    <div>
      <h1>合計: {total}</h1>
      <p>現在のステップ: {step}</p>
      <button onClick={() => setStep((prevStep) => prevStep + 1)}>
        ステップアップ
      </button>
      <IncrementButton onIncrement={handleIncrement} label="合計を増やす" />
      <button onClick={() => console.log("親のレンダリング")}>
        親レンダリング
      </button>
    </div>
  );
};

export default App;
```

**解説:**

- `IncrementButton`は`React.memo`でラップされています。
- `handleIncrement`は`useCallback`でメモ化されており、依存配列に`step`が含まれています。
- `step`が変更されると、`handleIncrement`の参照が新しくなります。これにより`IncrementButton`は再レンダリングされます。
- `step`が変わらない限り、`App`が再レンダリングされても`IncrementButton`は再レンダリングされません。

---

### 4. `React.memo`と`useCallback`/`useMemo`の組み合わせ

これが最も一般的なパフォーマンス最適化のパターンです。子コンポーネントを`React.memo`でラップし、子コンポーネントに渡すオブジェクト（`useMemo`）や関数（`useCallback`）の参照を安定させることで、不要な再レンダリングを効果的に防ぎます。

```typescript
import React from "react";

// 子コンポーネント: ユーザーリスト表示
interface User {
  id: number;
  name: string;
}

interface UserListProps {
  users: User[];
  onSelectUser: (id: number) => void;
}

const UserList: React.FC<UserListProps> = React.memo(
  ({ users, onSelectUser }) => {
    console.log("UserListがレンダリングされました");
    return (
      <div
        style={{ border: "1px solid green", margin: "10px", padding: "10px" }}
      >
        <h3>ユーザーリスト</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name}{" "}
              <button onClick={() => onSelectUser(user.id)}>選択</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

// 親コンポーネント
const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );

  // ユーザーデータをuseMemoでメモ化 (変更されない限り同じ参照を返す)
  const users: User[] = React.useMemo(
    () => [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ],
    []
  ); // 依存配列が空なので、初回レンダリング時のみ生成

  // onSelectUser関数をuseCallbackでメモ化 (参照が常に安定)
  const handleSelectUser = React.useCallback((id: number) => {
    setSelectedUserId(id);
    console.log(`ユーザーID: ${id} が選択されました`);
  }, []); // 依存配列が空なので、初回レンダリング時のみ生成

  return (
    <div>
      <h1>Appコンポーネントのカウンター: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Appカウンターアップ</button>

      {selectedUserId && <p>選択されたユーザーID: {selectedUserId}</p>}

      {/* usersとhandleSelectUserはメモ化されているため、
          Appのcountが変更されてもUserListは再レンダリングされない */}
      <UserList users={users} onSelectUser={handleSelectUser} />
    </div>
  );
};

export default App;
```

**解説:**

- `UserList`コンポーネントは`React.memo`でラップされています。
- `users`配列は`useMemo`でメモ化されており、`App`が再レンダリングされても参照が変わりません。
- `handleSelectUser`関数は`useCallback`でメモ化されており、`App`が再レンダリングされても参照が変わりません。
- 結果として、`App`コンポーネントの`count`が変更されても、`UserList`は props の変更を検知せず、再レンダリングされません。これにより、パフォーマンスが向上します。
- もし`users`や`handleSelectUser`がメモ化されていない場合、`App`が再レンダリングされるたびに新しい参照が生成され、`UserList`も常に再レンダリングされてしまいます。

---

### まとめと考慮事項

#### メモ化が有効なケース

- **レンダリングコストが高いコンポーネント:** 複雑な計算や多くの DOM 要素を生成するコンポーネント。
- **頻繁に再レンダリングされる親コンポーネントの子:** 親が State 変更で頻繁にレンダリングされるが、子に渡される props が変わらない場合。
- **リスト内のアイテム:** 大規模なリストの各アイテムコンポーネントをメモ化することで、リスト全体の再レンダリングを最適化できます。

#### メモ化の注意点とデメリット

- **過度なメモ化は逆効果:** メモ化自体にもコスト（比較処理、メモリ消費）がかかります。不必要にメモ化すると、メモ化しない場合よりもパフォーマンスが悪化する可能性があります。
- **デバッグの複雑化:** メモ化によって再レンダリングがスキップされるため、コンポーネントがいつ、なぜ再レンダリングされないのかを理解するのが難しくなることがあります。
- **依存配列の正確性:** `useMemo`や`useCallback`の依存配列に誤りがあると、古い値が使われたり、予期しない再レンダリングが発生したりします。ESLint の`react-hooks/exhaustive-deps`ルールを活用して、依存配列の漏れを防ぎましょう。
- **参照の比較:** `React.memo`や`useMemo`/`useCallback`はデフォルトで参照の比較を行います。オブジェクトや配列の中身が変更された場合でも、参照が変わらなければメモ化が有効になりますが、参照が変われば再レンダリングされます。深い比較が必要な場合は、カスタム比較関数を検討するか、イミュータブルなデータ構造を使用することが推奨されます。

#### どちらを使うべきか？

- **コンポーネント全体をメモ化したい場合:** `React.memo`
- **重い計算結果の値をメモ化したい場合:** `useMemo`
- **子コンポーネントに渡す関数の参照を安定させたい場合:** `useCallback`

基本的には、`React.memo`と`useCallback`の組み合わせを優先的に検討し、計算量の多い値に対して`useMemo`を使用するのが良いプラクティスです。ただし、**パフォーマンスのボトルネックが確認されない限り、積極的にメモ化を行う必要はありません。** まずはシンプルに実装し、問題が発生した際に最適化としてメモ化を導入するのが健全なアプローチです。

---

React のメモ化は、大規模なアプリケーションやパフォーマンスが重要な場面で非常に強力なツールとなります。これらのパターンと具体例を参考に、状況に応じて適切にメモ化を活用してください。
