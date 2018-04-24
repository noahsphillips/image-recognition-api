let bookshelf = require('../app/lib/db'),
  Upload = bookshelf.Model.extend({
    tableName: 'uploads',
    hasTimestamps: true
  }, {
    getAttributes: () => {
      return [
        'id',
        'url',
        'all_labels',
        'created_at',
        'updated_at'
      ];
    }
  });

module.exports = bookshelf.model('Upload', Upload);
