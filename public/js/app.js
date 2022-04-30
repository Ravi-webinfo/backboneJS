$(document).ready(function() {
  var BlogModel = Backbone.Model.extend({
    default: {
      title: '',
      content: '',
      image: null,
      description: ''
    }
  });

  var blogModel = new BlogModel();

  var HeroSectionView = Backbone.View.extend({
    el: '#content',
    template: _.template('Blogs...'),
    initialize: function() {
      this.render();
    },
    render: function() {
      var back = this;
      this.getTemplateData().then(function(data) {
        axios.get('/blogs/all').then(function(response) {
          var template = Handlebars.compile(data) 
          back.$el.html(template(response.data.blogs))
        }).catch(function(e) {
          console.log(e.message)
        })
        
      })
      this.$el.html(this.template());
    },
    getTemplateData: async function() {
      return await $.get('/handlebars/blogs.hbs').then(function(data) {
        return data;
      })
    }
  });


  var BlogView = Backbone.View.extend({
    el: '#content',
    initialize: function() {
      this.render();
      $('#summernote').on('summernote.image.upload', function() {
        console.log('Summernote is launched');
      });
    },
    render: function() {
      var back = this;
      this.getTemplateData().then(function(data) {
        back.$el.html(Handlebars.compile(data))

        $('#submit').on('click', function() {
          back.model.set('title', $('#title').val());
          back.model.set('content', $('#summernote').summernote('code'));
          back.model.set('description', $('#description').val());
          back.model.set('image', $('#image').prop('files')[0]);

          var validate = true;

          if(back.model.get('title').length < 1) {
            validate = false;
            $('.error-title').css("display", "block");
            $('.error-title').html('Title is require.')
          } else {
            $('.error-title').html('')
            $('.error-title').css("display", "none");
          }

          if(back.model.get('description').length < 1) {
            validate = false;
            $('.error-description').css("display", "block");
            $('.error-description').html('Description is required.');
          } else {
            $('.error-description').css("display", "none");
            $('.error-description').html('');
          }
          
          if(back.model.get('content').length < 40) {
            validate = false;
            $('.error-content').css("display", "block");
            $('.error-content').html('Content is required.');
          } else {
            $('.error-content').css("display", "none");
            $('.error-content').html('');
          }

          if(back.model.get('image') == null) {
            validate = false;
            $('.error-image').css("display", "block");
            $('.error-image').html('Blog image is required.')
          } else {
            $('.error-image').css("display", "none");
            $('.error-image').html('')
          }

          if(validate) {
            var formData = new FormData();

            formData.append('title', back.model.get('title'))
            formData.append('content', back.model.get('content'))
            formData.append('description', back.model.get('description'));

            formData.append('image', back.model.get('image'), back.model.get('image').name)


            axios({
              method:'post',
              url: 'http://localhost:3000/blogs/create',
              data: formData,
              headers: {
                "Content-Type": "application/form-data"
              }
            }).then(function(res) {
              $('#title').val('');
              $('#summernote').val('');
              $('#description').val('');
              $('#image').val('');
              $('#summernote').summernote('code', '<p><br></p>')
              $('.message').html(`<div class="alert alert-success alert-dismissible fade show" role="alert"><strong>Blog</strong> created successfully.<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`)
            }).catch(function(e) {
              console.log(e.response)
              if(e.response.data.errors.image.length > 0)
                $('.message').html(`<div class="alert alert-danger alert-dismissible fade show" role="alert">${e.response.data.errors.image[0]}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`)
            })
          }
        })

        
      })
    },
    getTemplateData: async function()  {
      return await $.get('/handlebars/editor.hbs').then(function(data) {
        return data;
      })
    }
  });


  var SignleBlog = Backbone.View.extend({
    el: '#content',
    initialize: function() {
      this.render();
    },
    render: function() {
      var back = this;
      axios.get(`/blogs/single-blog/${this.id}`).then(function(res) {
        if(res.status === 200) {
          back.getTemplateData().then(function(data) {
            var template = Handlebars.compile(data) 
            back.$el.html(template(res.data.blog))
          })
        } else {
          back.getTemplateData().then((data) =>  {
            var template = Handlebars.compile(data)
            back.$el.html(template({content: '<p>No Blog found with provided id.</p>'}))
          })
        }
      }).catch(function(err) {
        console.log(err.message)
      })
    },
    getTemplateData: async function() {
      return await $.get('/handlebars/singleBlog.hbs').then(function(data) {
        return data;
      })
    }
  })

  var Router = Backbone.Router.extend({
    routes: {
      "": 'home',
      "blogs": "blogs",
      "read-more/:id": "read_more"
    },
    home: function() {
      var heroSectionView = new HeroSectionView({
        model: blogModel
      });
    },
    blogs: function() {
      var blogview = new BlogView({
        model: blogModel
      });
    },
    read_more: function(id) {
      var singleBlog = new SignleBlog({
        id:id
      })
    }
  })

  var router = new Router();

  Backbone.history.start();
})