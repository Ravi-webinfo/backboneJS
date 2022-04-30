const {database} = require('../utils/database')
const Router = require('express').Router();
const path = require('path');
const { default: knex } = require('knex');
const {Blob} = require('buffer')

var supportedExtension = [".jpeg", ".jpg", ".png"];


Router.get('/', (req, res) => {
  database('blogs').select('*').then(function(data) {
    return res.status(200).json({
      success:true,
      message: 'All Blogs',
      body: data
    })
  }).catch(function(e) {
    console.log(e.message);
    return res.status(200).json({
      success:false,
      message: e.message,
      body: []
    })
  });
})

Router.post('/image-upload', (req, res) => {
  var blogImage = {
    timestamp: '',
    file_extension: '',
    filename: '',
    blogFile: null
  }

  if (Object.keys(req.files ? req.files : {}).length > 0) {
    blogImage.blogFile = req.files.ImageFile
    if(supportedExtension.includes(path.extname(blogImage.blogFile.name))) {
        let timestamp = Math.floor(+new Date() / 1000);
        blogImage.timestamp = timestamp;
        blogImage.file_extension = path.extname(blogImage.blogFile.name);
        let filename = timestamp.toString()+path.extname(blogImage.blogFile.name);
        blogImage.filename = filename;
        blogImage.blogFile.mv(path.join(__dirname,'../','public', 'blog-images', filename), function(err) {
            if(err) {
              return res.status(403).json({success:false, message: 'Something went wrong while uploading image.'});
            } else {
              return res.status(200).json({success:true, message: 'Image upload successfully', fileName: blogImage.filename});
            }
        })
    } else {
      return res.status(403).json({success:false, message: "Uploaded file is not supported."});
    }
  } else {
    return res.status(403).json({success:false, message: "No image file provided"});
  }
})


Router.get('/all', (req, res) => {
  database('blogs').select('*').orderBy('id', 'desc').then(function(blogs) {
    return res.status(200).json({
      success:true,
      message: 'leatest blogs',
      blogs: blogs
    });
  }).catch(function(e) {
    return res.status(502).json({
      success:false,
      message: "Something went wrong",
      error: e.message
    })
  })
});


Router.post('/create', (req, res) => {
  var errors = {
    title: [],
    description: [],
    image: [],
    content: []
  }
  if(!req.body.title || req.body.title == '') {
    errors.title.push('Title is required.')
  }

  if(!req.body.description || req.body.description == '') {
    errors.description.push('Description is required.')
  }

  if(!req.body.content || req.body.content == '') {
    errors.content.push('Content is required.')
  }

  if(Object.keys(req.files ? req.files : {}).length < 1) {
    errors.image.push('Image file is required.')
  }

  if(
    errors.title.length > 0 || 
    errors.description.length > 0 ||
    errors.content.length > 0 ||
    errors.image.length > 0 
  ) {
    return res.status(403).json({
      success:false,
      errors: errors
    })
  } else {
    var blog = {
      title: req.body.title,
      content: req.body.content,
      description: req.body.description,
      image: {
        name: '',
        file: null,
        timestamp: '',
        extension: '',
        path: ''
      }
    }
    
    blog.image.file = req.files.image
    if(supportedExtension.includes(path.extname(blog.image.file.name))) {
        let timestamp = Math.floor(+new Date() / 1000);
        blog.image.timestamp = timestamp;
        blog.image.extension = path.extname(blog.image.file.name);
        let filename = timestamp.toString()+path.extname(blog.image.file.name);
        blog.image.name = filename;
        blog.image.file.mv(path.join(__dirname,'../','public', 'blog-images', filename), function(err) {
            if(err) {
              return res.status(403).json({success:false, errors: {image: ["Somethig went wrong while uploading image file."]}});
            } else {
              blog.image.path = 'http://localhost:3000/blog-images/'+filename;

              database('blogs').insert({
                title: blog.title,
                content: blog.content,
                description: blog.description,
                image: blog.image.path
              }).then(function(result) {
                return res.status(201).json({
                  success:true,
                  message: 'Blog created successfully.',
                  blog: result
                })
              }).catch(function(e) {
                return res.status(403).json({
                  success:false,
                  message: 'Error occured while creating blog',
                  error: e.message
                })
              })
            }
        })
    } else {
      return res.status(403).json({success:false, errors: {image: ["Uploaded file is not supported, try jpeg, jpg or png file."]}});
    }


  }
})

Router.get('/single-blog/:id', (req, res) => {
  if(!req.params.id) {
    return res.status(403).json({
      success:false,
      message: "Blog id is required."
    })
  } else {
    database('blogs').where({id:req.params.id}).select('*').then(function(blog) {
      if(blog.length > 0) {
        var html = Buffer.from(blog[0].content, 'html')
        blog[0].content = html.toString();
        return res.status(200).json({
          success:true,
          blog: blog[0]
        })
      } else {
        return res.status(204).json({
          success:false,
          message: 'No blog found within provided id.'
        })
      }
    })
  }
})

module.exports = Router