import mongoose from 'mongoose';
import Blog from '../models/blogsModel.js';
import Category from '../models/categoryModel.js';
const getAllBlogs = async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const category = req.query.category;

    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { keywords: { $regex: search, $options: 'i' } },
          { heading: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { focusKeyword: { $regex: search, $options: 'i' } },
        ],
      };
    }
    if (category) {
      query['category'] = category;
    }

    const blogs = await Blog.find(query)
      .skip(skip)
      .limit(limit)
      .populate('category');
    const categories = await Category.find({});
    const numBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(numBlogs / limit);

    res.status(200).json({
      data: blogs,
      categories,
      totalPages,
    });
  } catch (error) {
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const getBlog = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const blog = isValidId
      ? await Blog.findById(id)
      : await Blog.findOne({ slug: id });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: `get blog by id ${id}`, data: blog });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const createBlog = async (req, res, next) => {
  const { category: categoryId } = req.body;
  const faqs = req?.body?.faqs ? JSON.parse(req.body.faqs) : [];
  const imageCover = req?.files?.imageCover?.map(file => file?.location)[0];

  const newBlogData = { ...req.body, imageCover, faqs };

  try {
    const blog = await Blog.create({
      ...newBlogData,
      category: categoryId,
    });

    await Category.findByIdAndUpdate(categoryId, {
      $addToSet: { blogs: blog._id },
    });

    res.status(201).json({ message: 'success', data: blog });
  } catch (error) {
    res.status(404).json({ message: 'Fail', error: error.message });
    // next(error);
  }
};

const updateBlog = async (req, res, next) => {
  const { id } = req.params;
  const faqs = req?.body?.faqs ? JSON.parse(req.body.faqs) : [];
  const { slug, ...newBlogData } = req.body;

  try {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const blog = isValidId
      ? await Blog.findById(id)
      : await Blog.findOne({
          slug: id,
        });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    let imageCover;

    if (req?.files?.imageCover?.length) {
      imageCover = req?.files?.imageCover?.map(file => file?.location)[0];
    } else if (req.body.imageCover) {
      imageCover = req.body.imageCover[0].preview;
    } else {
      imageCover = blog.imageCover;
    }
    // const imageCover =
    //   req?.files?.imageCover?.map(file => file?.location)[0] ||
    //   req.body.imageCover ||
    //   blog.imageCover;

    await Blog.findByIdAndUpdate(
      id,
      {
        ...newBlogData,
        faqs,
        imageCover,
      },
      {
        new: true,
        // revalidate: true,
      }
    );

    res.status(200).json({ message: `Blog updated ${id}` });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: `Blog deleted ${id}` });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

export { getAllBlogs, getBlog, createBlog, updateBlog, deleteBlog };
