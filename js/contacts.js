var templates = {};
var contacts;
var manager;
var tags;
var search;

$(function() {
  var $main = $('main');

  function getFormObject($form) {
    var object = {};
    var tags = [];

    $form.serializeArray().forEach(function(input) {
      var key = input.name;
      var value = input.value;

      if (key === 'id') { value = parseInt(value, 10); }
      if (key === 'tags') { tags.push(value); }
      object[key] = value;
    });
    object.tags = tags;
    return object;
  }

  contacts = {
    $page: $main.find('#contacts'),
    $el: $main.find('#contact-list'),
    $new: $main.find('#new-contact'),
    $edit: $main.find('#edit-contact'),
    collection: [],
    lastId: 0,
    new: function(e) {
      e.preventDefault();

      this.lastId++;
      this.$page.fadeOut();
      this.$new.html(templates.new({ id: this.lastId, tags: tags.collection }));
      this.$new.fadeIn();
    },
    add: function(contact) {
      if (this.$el.find('#empty-contacts').length) {
        this.$el.html(templates.contactList({ contacts: this.collection }));
      } else {
        this.$el.append(templates.contact(contact));
      }
    },
    create: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var contact = getFormObject($form);

      this.collection.push(contact);
      this.add(contact);
      this.show();
    },
    edit: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var id = $el.closest('li').data('id');
      var contact = this.get(id);
      var otherTags = tags.collection.filter(function(tag) {
        return contact.tags.indexOf(tag) === -1;
      });

      this.$edit.html(templates.edit({ contact: contact, tags: otherTags }));
      this.$edit.fadeIn();
      this.$page.fadeOut();
    },
    update: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var id = $form.data('id');
      var contact = this.get(id);
      
      $.extend(contact, getFormObject($form));
      this.render();
      this.show();
    },
    get: function(idx) {
      return this.collection.find(function(contact) {
        return contact.id === idx;
      });
    },
    delete: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var $li = $el.closest('li');
      var id = $li.data('id');
      
      if (confirm('Are you sure?')) {
        $li.remove();
        this.destroy(id);        
      }
      if (!this.collection.length) { this.emptyMessage(); }
    },
    destroy: function(idx) {
      this.collection = this.collection.filter(function(contact) {
        return contact.id !== idx;
      });
    },
    emptyMessage: function() {
      this.$el.append(templates.emptyMessage());
    },
    render: function() {
      this.$el.html(this.template({ contacts: this.collection }));
    },
    show: function() {
      $('.container:visible').fadeOut();
      this.$page.fadeIn();
    },
    cancel: function(e) {
      e.preventDefault();
      var $el = $(e.target);

      $el.closest('.container').fadeOut();
      this.$page.fadeIn();
    },
    load: function() {
      this.collection = JSON.parse(localStorage.getItem('contacts2')) || [];
      this.lastId = parseInt(localStorage.getItem('lastId2'), 10) || 0;
    },
    save: function() {
      localStorage.setItem('contacts2', JSON.stringify(this.collection));
      localStorage.setItem('lastId2', this.lastId);
    },
    bindEvents: function() {
      this.$page.on('click', 'a.add-contact', this.new.bind(this));
      this.$el.on('click', 'a.edit', this.edit.bind(this));
      this.$el.on('click', 'a.delete', this.delete.bind(this));
      this.$new.on('submit', this.create.bind(this));
      this.$edit.on('submit', this.update.bind(this));
      $main.on('click', '.cancel', this.cancel.bind(this));
    },
    init: function() {
      this.template = templates.contactList;
      this.load();
      this.render();
      this.bindEvents();
      this.$page.slideDown();
    }
  };

  tags = {
    $el: $main.find('#tag-list'),
    $form: $main.find('#add-tag'),
    collection: [],
    get: function(tagName) {
      return this.collection.find(function(tag) {
        return tag === tagName;
      });
    },
    create: function(e) {
      e.preventDefault();
      var $input = this.$form.find('#new-tag');
      var tag = $input.val();

      if (!tag.length || this.get(tag)) { return; }
      this.collection.push(tag);
      this.$el.append(templates.tag(tag));
      $input.val('');
    },
    remove: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var tag = $el.prev().text();

      if (this.isInUse(tag)) {
        alert("You cannot delete a tag that is used by a contact");
      } else {
        $el.closest('li').remove();
        this.delete(tag);
      }
    },
    delete: function(tagName) {
      this.collection = this.collection.filter(function(tag) {
        return tag !== tagName;
      });
    },
    isInUse: function(tagName) {
      return contacts.collection.some(function(contact) {
        return contact.tags.some(function(tag) {
          return tag === tagName;
        });
      });
    },
    render: function() {
      this.$el.html(this.template({ tags: this.collection }));
    },
    load: function() {
      this.collection = JSON.parse(localStorage.getItem('tags2')) || [];
    },
    save: function() {
      localStorage.setItem('tags2', JSON.stringify(this.collection));
    },
    bindEvents: function() {
      this.$form.on('submit', this.create.bind(this));
      this.$el.on('click', 'a.remove-tag', this.remove.bind(this));
    },
    init: function() {
      this.template = templates.tagList;
      this.load();
      this.render();
      this.bindEvents();
    }
  };

  search = {
    $input: $main.find('#search'),
    $tags: tags.$el,
    $contacts: contacts.$el,
    term: '',
    tags: [],
    setTerm: function() {
      this.term = this.$input.val();
      this.run();
    },
    setTags: function(e) {
      e.preventDefault();
      var $link = $(e.target);
      var tags = [];

      $link.toggleClass('active');
      this.$tags.find('a.active').each(function() {
        tags.push($(this).text());
      });
      this.tags = tags;
      this.run();
    },
    filterByTerm: function($li) {
      var term = this.term;

      return $li.filter(function() {
        var contactName = $(this).find('h3').text();

        return contactName.indexOf(term) !== -1;
      });
    },
    filterByTags: function($li) {
      var tags = this.tags;

      return $li.filter(function() {
        var contactTags = $(this).find('.contact-tags').text().trim().split(', ');

        return tags.every(function(tag) {
          return contactTags.indexOf(tag) !== -1;
        });
      });
    },
    run: function() {
      var $li = this.$contacts.find('li');
      var $emptySearch = this.$contacts.find('#empty-search');

      $li.hide();
      if (this.term) { $li = this.filterByTerm($li); }
      if (this.tags) { $li = this.filterByTags($li); }
      $li.show();
      if ($li.length) {
        $emptySearch.remove();
      } else {
        if (!$emptySearch.length) {
          this.$contacts.append(templates.emptySearch());
        }
      }
    },
    bindEvents: function() {
      this.$input.on('keyup', this.setTerm.bind(this));
      this.$tags.on('click', 'a.tag-name', this.setTags.bind(this));
    },
    init: function() {
      this.bindEvents();
    }
  };

  manager = {
    cacheTemplates: function() {
      $("script[type='text/x-handlebars']").each(function() {
        var $template = $(this);
        templates[$template.attr('id')] = Handlebars.compile($template.html());
      });

      $("[data-type='partial']").each(function() {
        var $partial = $(this);
        Handlebars.registerPartial($partial.attr('id'), $partial.html());
      });
    },
    save: function() {
      contacts.save();
      tags.save();
    },
    bindEvents: function() {
      $(window).on('unload', this.save.bind(this));
    },
    init: function() {
      this.cacheTemplates();
      contacts.init();
      tags.init();
      search.init();
      this.bindEvents();
    }
  };

  manager.init();
});