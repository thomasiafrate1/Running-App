import "../App.css";

export default function Users() {
  return (
    <div className="container">
      <h1>Connexion Admin</h1>
      <form>
        <div>
          <label>Email</label>
          <input type="email" />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" />
        </div>
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
