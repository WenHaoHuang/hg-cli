<script>
  import componentDoc from './example.js'
  export default {
    name: 'App',
    components: { componentDoc },
    render(h) {
      const template = h('div', { attrs: { id: 'app' } }, [
        h('component-doc')
      ]);
      return template;
    }
  };
  </script>
