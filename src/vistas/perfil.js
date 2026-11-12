export default function (Alpine) {
  Alpine.data('vistaPerfil', () => ({
    get usuario() {
      return this.$store.sesion.usuario;
    }
  }));
}
