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

// カスタム比較関数: propsが等しいかどうかを判定する
// この関数を React.memo の第2引数に渡すことで、再レンダリングの条件をカスタマイズできる。
//
// この関数がない場合、React.memoはpropsの「浅い比較(shallow comparison)」を行う。
// このサンプルでは `user` propはオブジェクトであり、1秒ごとに新しいオブジェクトが生成されるため、
// 浅い比較 (`prevProps.user === nextProps.user`) は常に false となり、毎回再レンダリングされてしまう。
//
// ここでは `user` オブジェクトの中の `id` と `name` だけを比較することで、`email` の変更を意図的に無視し、不要な再レンダリングを防いでいる。
const arePropsEqual = (
  prevProps: UserCardProps,
  nextProps: UserCardProps
): boolean => {
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name
  );
};

const MemoizedUserCard = React.memo(UserCard, arePropsEqual);

const Memo1: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [user, setUser] = React.useState<User>({
    id: 1,
    name: "Bob",
    email: "bob@example.com",
  });

  // 1秒ごとにユーザーのemailを更新 (ただし、idとnameは同じ)
  React.useEffect(() => {
    // `setInterval` は、指定された時間ごとに関数を繰り返し実行するWeb API（ブラウザの標準機能）。
    // ここでは1000ミリ秒（1秒）ごとにsetUserを呼び出している。
    // 返り値として、タイマーを識別するための「インターバルID」を返す。
    const interval = setInterval(() => {
      setUser((prevUser) => ({
        ...prevUser,
        email: `bob${Math.random().toFixed(2)}@example.com`,
      }));
    }, 1000);
    // useEffectのクリーンアップ関数。コンポーネントがアンマウント（画面から消える）される時に実行される。
    // `clearInterval` は、`setInterval`によって設定されたタイマーを停止するためのWeb API。
    // 引数には `setInterval` が返したインターバルIDを渡す。
    // これを忘れると、コンポーネントが消えてもタイマーが動き続け、メモリリークの原因になる。
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

export default Memo1;
