class Book < ApplicationRecord
  validates :title, presence: true, :uniqueness => true
  validates :author, presence: true
  validates :cover, presence: true
  validates :link, presence: true
end
